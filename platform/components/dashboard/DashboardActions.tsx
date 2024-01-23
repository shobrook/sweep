
import { Input } from "@/components/ui/input";
import { ResizablePanel } from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { runScript } from "@/lib/api.service";
import { toast } from "sonner";
import { FaArrowRotateLeft, FaCheck, FaPen, FaPlay } from "react-icons/fa6";
import { useLocalStorage } from 'usehooks-ts';
import { Label } from "../ui/label";



const DashboardDisplay = ({ filePath, setScriptOutput, file, setFile, hideMerge, setHideMerge, setOldFile, repoName, setRepoName}
    : { filePath: string, setScriptOutput: any, file: string, setFile: any, hideMerge: boolean, setHideMerge: any, setOldFile: any, repoName: string, setRepoName: any }) => {
    const [script, setScript] = useLocalStorage("script", '');
    const [instructions, setInstructions] = useLocalStorage("instructions", '');
    const [isLoading, setIsLoading] = useState(false)
    const [branch, setBranch] = useState("");
    const [currentRepoName, setCurrentRepoName] = useState(repoName);
    useEffect(() => {
        (async () => {
            const params = new URLSearchParams({repo: "/home/kevin/sweep"}).toString();
            const response = await fetch("/api/branch?" + params)
            const object = await response.json()
            setBranch(object.branch)
        })()
    }, [])

    const updateScript = (event: any) => {
        setScript(event.target.value);
    }
    const updateInstructons = (event: any) => {
        setInstructions(event.target.value);
    }
    const runScriptWrapper = async (event: any) => {
        const response = await runScript(repoName, filePath, script);
        console.log("run script response", response)
        let scriptOutput = response.stdout + "\n" + response.stderr
        if (response.code != 0) {
            toast.error("An Error Occured", {
                description: [<div key="stdout">{response.stdout}</div>, <div className="text-red-500" key="stderr">{response.stderr}</div>,]
            })
        } else {
            toast.success("The script ran successfully", {
                description: [<div key="stdout">{response.stdout}</div>, <div className="text-red-500" key="stderr">{response.stderr}</div>,]
            })
        }
        setScriptOutput(scriptOutput)
    }
    const getFileChanges = async () => {
        setIsLoading(true)
        const url = "/api/openai/edit"
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                fileContents: file,
                prompt: instructions
            })
        })
        const object = await response.json();
        console.log(object)
        setIsLoading(false)
        toast.success("Successfully generated tests!")
        file = file + object.newFileContents;
        console.log("file is", file)
        setFile(file)
        setHideMerge(false)
    }

    return (
        <ResizablePanel defaultSize={33} className="p-6 h-[90vh]">
            <div className="flex flex-col h-full">
                <Label className="mb-2">
                    Path to Repository
                </Label>
                <Input id="name" placeholder="Enter Repository Name" value={currentRepoName} className="col-span-4 w-full" onChange={(e) => setCurrentRepoName(e.target.value)} onBlur={() => {
                    setCurrentRepoName(currentRepoName => {
                        setRepoName(currentRepoName)
                        return currentRepoName
                    })
                }}/>
                <p className="text-sm text-muted-foreground mb-4">
                    Use the absolute path to the repository you want to test.
                </p>
                <Label className="mb-2">
                    Branch
                </Label>
                <Input className="mb-4" value={branch}/>
                <Label className="mb-2">
                    Instructions
                </Label>
                <Textarea id="instructions-input" placeholder="Edge cases for Sweep to cover." value={instructions} className="grow mb-4" onChange={updateInstructons}></Textarea>
                <Label className="mb-2">
                    Test Script
                </Label>
                <Textarea id="script-input" placeholder="Enter your script here" className="col-span-4 mb-4 w-full font-mono" value={script} onChange={updateScript}></Textarea>
                <div className="flex flex-row justify-center">
                    <Button
                        className="mt-4 mr-2 bg-green-600 hover:bg-green-700"
                        onClick={runScriptWrapper}
                        disabled={isLoading}
                    >
                        <FaCheck />
                    </Button>
                    <Button
                        className="mt-4 mr-2"
                        variant="destructive"
                        onClick={runScriptWrapper}
                        disabled={isLoading}
                    >
                        <FaArrowRotateLeft />
                    </Button>
                    <Button
                        className="mt-4 mr-2"
                        variant="secondary"
                        onClick={runScriptWrapper}
                        disabled={isLoading || !script.length}
                    >
                        <FaPlay />&nbsp;&nbsp;Run tests
                    </Button>
                    <Button
                        className="mt-4 mr-4"
                        variant="secondary"
                        onClick={getFileChanges}
                        disabled={isLoading}
                    >
                        <FaPen />&nbsp;&nbsp;Generate tests
                    </Button>
                    {/* <Button
                        className="mt-4 mr-4"
                        variant="secondary"
                        onClick={() => {setHideMerge(!hideMerge)}}
                        disabled={isLoading}
                    >
                        Toggle Merge View(debug)
                    </Button> */}
                </div>
            </div>
        </ResizablePanel>
    );
};

export default DashboardDisplay;

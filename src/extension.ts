import { stringify } from 'querystring';
import { isGeneratorFunction } from 'util/types';
import * as vscode from 'vscode';
let API_URL = "";
let API_KEY = "";

const queryAI = async (msg: any): Promise<any> => {
    try {
        const response = await fetch(API_URL + "chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(msg)
        });

        const rep = await response.json();
        return rep;
    } catch (err) {
        console.error("ERROR", err); // Use console.error for errors
        return "ERROR";
    }
};

const getFromSettings = async () => {
    const settings = vscode.workspace.getConfiguration('ai-js-commentor-apiurl');
    console.log(settings);
	API_URL = settings.url;
	API_KEY = settings.key;
    return true;
};



const getSelectedFunction = async (): Promise<any> => {
  let editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    const start = selection.start;
    const end = selection.end;
    let selectedText = new vscode.Range(selection.start,selection.end);
    let selText = editor.document.getText(selectedText);
    return {
            "text":selText,
            "editor":editor,
            error:undefined
        }
    }
    else
        return {text:"",editor:{},error:"No Editor Found"}; // Return "false" if no editor is available
};

const replaceSelText = (returntext:string)  =>{
    let editor = vscode.window.activeTextEditor;
    if(editor){
        const selection = editor.selection;
        if(!selection.isEmpty){
            editor.edit(editBuilder =>{
                editBuilder.replace(selection,returntext)
            })
        }
        else{
            editor.edit(editBuilder =>{
                editBuilder.insert(selection.active,returntext)
            })
        }
        return true;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const disp_queryAI = vscode.commands.registerCommand('ai-js-commentor.lfAiJsComment', async () => {
		await getFromSettings();
        let ftext = await getSelectedFunction();
        if(!ftext.error){
            let aitext = "Write a verbose jsdoc compliant comment for the following function and output only the comment:\n"+
                        ftext.text;
            console.log("Calling queryAI...\n",aitext);
            const result = await queryAI({
                    model:"llama3.2:1b",
                    messages:[
                        {role:"user","content":aitext}
                    ]
            });
            let returntext = result.choices.map((c: { message: { content: any; }; }) => c.message.content)
                                    .join("\n");
            console.log(returntext);
            vscode.env.clipboard.writeText(returntext).then(()=>{
                vscode.window.showInformationMessage("comment from AI copied to clipboard")
            })
        }
        else{
            console.log("ERROR",ftext.error)
        }
    });
    context.subscriptions.push(disp_queryAI);
}
export function deactivate() {}
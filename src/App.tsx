import { useEffect, useRef, useState } from "react";

import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { localDataDir, resolveResource } from '@tauri-apps/api/path';
import { appWindow } from "@tauri-apps/api/window";
import "./App.css";
import { useHotkeys } from "react-hotkeys-hook";
import { message } from "@tauri-apps/api/dialog";


 


function App() {
  const [result, setResult] = useState("")
  const [pin, setPin] = useState(true)

  const map = useRef({})

  const inp = useRef<HTMLInputElement>(null)

  const local_file_ref = useRef("")

  useEffect(() => {
    localDataDir().then(path => {
      //console.log("ppppppppppp ", path)
      local_file_ref.current = path + "top-dict/total.json"
      exists(path + "top-dict").then(exist =>{
        if(!exist) {
          //console.log("!!!!! ", exist)
          createDir(path + "top-dict", {recursive: true})
        }
      })
    })

    map.current = new Map<string, string>();
    exists("top-dict/total.json", {dir: BaseDirectory.LocalData}).then(exist => {
      if(exist) {
        readTextFile(local_file_ref.current).then(file_res => {
          let map_total: Map<string,string> = new Map(Object.entries(JSON.parse(file_res)))
          map.current = map_total;       
        })
      }else{
        resolveResource("data/total.json").then(data_file => {    //   /usr/lib/top-dict/data
          readTextFile(data_file).then(file_res => {
            let map_total: Map<string,string> = new Map(Object.entries(JSON.parse(file_res)))
            map.current = map_total;       
          })
        })
      }
    })
    //appDataDir().then(path => console.log("$APPDATA ", path)) // ~/.local/share/com.user.dev/"   
    //localdata  .local/share/
    //data .local/share/
    //applocaldata .local/share/com.user.dev
    //resource  ~/dev-wp/junk/tauri-test/top-dict/src-tauri/target/debug/
    //runtime "/run/user/1000/"
    //app  ~/.config/com.user.dev/

    
    



    //let totalmap = map.current as Map<string,string>
    //console.log("*************************1*    ", totalmap.size)   //45681

    //   let totalstr = JSON.stringify(Object.fromEntries(totalmap))
    //   writeTextFile('total.json', totalstr, { dir: BaseDirectory.AppConfig });
    
    
  }, [])

  function search(str :string ){

    setResult("")
    //let word = document.getElementById("inp")?.nodeValue;
    let datamap = map.current as Map<string,string>;
    let mapRes = datamap.get(str) as string 
    //console.log("@@@@@@", mapRes)
    if(mapRes === null || mapRes === undefined){
      setResult("")
    }else{
      setResult(mapRes)
    }
  }

  function togglePin() {
    setPin(!pin)
    appWindow.setAlwaysOnTop(pin)
  }
  
  // function saveWord(key: string){
  //   console.log("KKKKKKKKKK   ", key)  //onKeyDown={(e)=>{saveWord(e.key.valueOf())}}
    
  // }

  useHotkeys(
    "ctrl+s",
    () => {
      //console.log("KKKKKKKKKK   ", (inp.current as HTMLInputElement).value)
      //console.log("KKKKKKKKKK   ", result)
      let inputEle = inp.current as HTMLInputElement
      if((inputEle.value !== "") && result !== "" ){
        let save_key = inputEle.value as  string
        (map.current as Map<string, string>).set(save_key, result)
        const obj = Object.fromEntries(map.current as Map<string, string>);
        const serialized = JSON.stringify(obj);
        writeTextFile(local_file_ref.current,  serialized).then(
          () => message("data updated !", " ^.^ Good ")
        )
      }
    },
    {
      enableOnFormTags: ["TEXTAREA","INPUT"],
    },
  );

  return (
    <div className="container" >
      <input ref={inp} type="text"   onChange={(e)=>search(e.target.value)} placeholder="enter a English word"  />
      <textarea  style={{height: "70px" }} value={result} onChange={(e)=>{setResult(e.target.value)}} placeholder="enter en/chn and press ctrl + s to save a record"></textarea>
      <button onClick={()=> togglePin() }>pin</button>
    </div>
  );
}

export default App;

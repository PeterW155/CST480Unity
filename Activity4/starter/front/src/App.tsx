import React, { FC, useState } from "react";
import axios from "axios";
import { MessageResponse } from "./types";
import { application, response } from 'express';
import restProvider from 'ra-data-simple-rest';
import { Unity, useUnityContext } from "react-unity-webgl";

// don't throw error if status code not 200 level
// https://github.com/axios/axios#handling-errors
axios.defaults.validateStatus = () => true;

const dataProvider = restProvider('http//localhost:3000');



let App: FC = () => {

    const { unityProvider } = useUnityContext({
        loaderUrl: "Build/Build.loader.js",
        dataUrl: "Build/Build.data.unityweb",
        frameworkUrl: "Build/Build.framework.js.unityweb",
        codeUrl: "Build/Build.wasm.unityweb",
    });


    let [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    // TODO
    let [loginMessage, setLoginMessage] = useState("");

    let handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setFormData({
            ...formData,
            [event.target.id]: event.target.value,
        });
    };

    let handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        console.log(formData);
        // TODO send login request, display response in UI
        fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: formData.username, password: formData.password }),
        }).then(response => {
            console.log("Response Received: ", response.status);
            console.log(response)
            let display = document.getElementById("loginMessage");
            let loginText;
            if(response.status == 200){
                loginText = "Logined In Successfully";
            } else {
                loginText = "Login in Failed";
            }
            display!.innerHTML = loginText;
            return response.json();
        }).catch(error => {
            console.log(error);
        });
    };

    let publicAPI = async () => {
        let response = await axios<MessageResponse>({
            method: "get",
            url: "/api/public",
        });
        console.log(response.data);
    };
    let privateAPI = async () => {
        let response = await axios<MessageResponse>({
            method: "get",
            url: "/api/private",
        });
        console.log(response.data);
    };
    let logout = async () => {
        await axios({
            method: "post",
            url: "/api/logout",
        }).then(response => {
            console.log(response.status);
        });
        //console.log(response.status);
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <input type="submit" value="Log in" />
            </form>

            <button onClick={publicAPI}>Public API</button>
            <button onClick={privateAPI}>Private API</button>
            <button onClick={logout}>Log out</button>

            {/* TODO */}
            {/* <div>{loginMessage}</div> */}
            
            <Unity unityProvider={unityProvider} />
            
        </>
    );
};

export default App;

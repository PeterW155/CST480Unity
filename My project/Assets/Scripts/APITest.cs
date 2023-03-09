using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Net;
using System;
using System.IO;
using TMPro;
using UnityEngine.UI;

public class APITest : MonoBehaviour
{
    public Button button;
    // Start is called before the first frame update
    void Start()
    {
        button.onClick.AddListener(delegate { Call(); } );
    }

    public void Call()
    {
        Debug.Log("Private Button clicked");
        try
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(String.Format("http://localhost:3000/api/private"));
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            StreamReader reader = new StreamReader(response.GetResponseStream());
            string jsonResponse = reader.ReadToEnd();
            reader.Close();
            APITest message = JsonUtility.FromJson<APITest>(jsonResponse);
            Debug.Log(message);
        }
        catch
        {
            Debug.Log("Got an error");
        }
        /*HttpWebRequest request = (HttpWebRequest)WebRequest.Create(String.Format("http://localhost:3000/api/private"));
        HttpWebResponse response = (HttpWebResponse)request.GetResponse();
        StreamReader reader = new StreamReader(response.GetResponseStream());
        string jsonResponse = reader.ReadToEnd();
        APITest message = JsonUtility.FromJson<APITest>(jsonResponse);
        Debug.Log(message);*/

    }
}

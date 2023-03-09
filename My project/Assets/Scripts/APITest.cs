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
            Debug.Log("Entered Try");
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(String.Format("http://localhost:3000/api/private"));
            Debug.Log("Line 1");
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Debug.Log("Line 2");
            StreamReader reader = new StreamReader(response.GetResponseStream());
            Debug.Log("Line 3");
            string jsonResponse = reader.ReadToEnd();
            Debug.Log("Line 4");
            reader.Close();
            Debug.Log("Line 5");
            APITest message = JsonUtility.FromJson<APITest>(jsonResponse);
            Debug.Log("Line 6");
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

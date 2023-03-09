using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Net;
using System;
using System.IO;
using TMPro;
using UnityEngine.UI;

public class Console : MonoBehaviour
{
    public Button button;
    // Start is called before the first frame update
    void Start()
    {
        button.onClick.AddListener(delegate { Call(); });
    }

    public void Call()
    {
        Debug.Log("Console Button clicked");
    }
}

Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
appFolder = fileSystem.GetParentFolderName(WScript.ScriptFullName)

checkCommand = "powershell.exe -NoProfile -Command " & Chr(34) & _
  "try { Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:4173/' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" & Chr(34)

If shell.Run(checkCommand, 0, True) <> 0 Then
  startCommand = "cmd.exe /c cd /d " & Chr(34) & appFolder & Chr(34) & " && node server.mjs"
  shell.Run startCommand, 0, False
  WScript.Sleep 2000
End If

browserPath = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Google\Chrome\Application\chrome.exe"
If Not fileSystem.FileExists(browserPath) Then browserPath = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Google\Chrome\Application\chrome.exe"
If Not fileSystem.FileExists(browserPath) Then browserPath = shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe"
If Not fileSystem.FileExists(browserPath) Then browserPath = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe"

If fileSystem.FileExists(browserPath) Then
  shell.Run Chr(34) & browserPath & Chr(34) & " --app=http://127.0.0.1:4173/", 1, False
Else
  shell.Run "http://127.0.0.1:4173/", 1, False
End If

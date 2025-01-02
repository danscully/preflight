<script>
  import VideoList from "./components/VideoList.svelte";
  import Rules from "./components/Rules.svelte";
  import  * as Card from "./lib/components/ui/card";
  import { Button } from "./lib/components/ui/button";
  import { ScrollArea } from "./lib/components/ui/scroll-area";
  import * as Tabs from "./lib/components/ui/tabs";
  import "./app.css";
  import logoPng from "./assets/logo.png";

  let videos = [];
  let rules = [];
  let functions = "";

  const addVideo = (video) => {
    videos.unshift(video);
    videos = videos;
  };

  const dropHandler = (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file.type == "application/json") {
            window.myAPI.invoke("load-rules-file", file.path).then((result) => {
              console.log("Updating Rules");
              var errorList = [];
              if (result != true) {
                errorList.push({ severity: "Error", message: result });
              } else {
                errorList.push({ severity: "Info", message: "Rules loaded." });
              }
              const fileObj = {
                filename: file.path,
                errorList: errorList,
              };
              addVideo(fileObj);
            });
          } else if (file.type == "text/javascript") {
            window.myAPI
              .invoke("load-user-functions-file", file.path)
              .then((result) => {
                console.log("Updating Functions");
                var errorList = [];
                if (result != true) {
                  errorList.push({ severity: "Error", message: result });
                } else {
                  errorList.push({
                    severity: "Info",
                    message: "User Functions loaded.",
                  });
                }
                const fileObj = {
                  filename: file.path,
                  errorList: errorList,
                };
                addVideo(fileObj);
              });
          } else {
            window.myAPI.invoke("run-checks", file.path).then(addVideo);
          }
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log("files");
        console.log(file);
        console.log(file.type);
        window.myAPI.invoke("run-checks", file.path).then(addVideo);
      });
    }
  };

  function dragOverHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  const cmdArgs = (event, files) => {
    for (const f of files) {
      console.log("cmdArg");
      console.log(f);
      window.myAPI.invoke("run-checks", f).then(addVideo);
    }
  };

  //window.myAPI.cmdArgSetup(cmdArgs)

  const clearResults = () => {
    videos = [];
  };

  const  onValueChange = (value) => {
    console.log(value);
    window.myAPI.invoke("get-rules").then((result) => {
      rules = result
    })
    window.myAPI.invoke("get-functions").then((result) => {
      functions = result
      console.log(functions)
    })
  }
</script>

<main class="container p-10">
  <div class="flex items-start justify-between">
    <div><img class="size-20" src={logoPng} /></div>
    <div class="flex items-end flex-col">
      <h2 class="font-bold">Preflight Content Checker</h2>
      <code>v25.01.02</code>
    </div>
  </div>

  <Tabs.Root
    value="checkfiles"
    onValueChange={onValueChange}
    class="mt-4 mb-4"
  >
    <Tabs.List>
      <Tabs.Trigger value="checkfiles">Check Files</Tabs.Trigger>
      <Tabs.Trigger value="makerules">Rules</Tabs.Trigger>
      <Tabs.Trigger value="functions">User Functions</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="makerules">
      <ScrollArea class="h-[calc(100vh_-_270px)] w-full">
        <Rules bind:rules />
      </ScrollArea>
    </Tabs.Content>
    <Tabs.Content value="checkfiles">
      <Card.Root class="border-dashed border-2 mt-5 mb-5 h-32 w-full">
        <Card.Content>
        <div
          class="size-full flex flex-col items-center justify-center"
          id="dropzone"
          on:drop={dropHandler}
          on:dragover={dragOverHandler}
        >
          <p>Drop your files here.</p>
        </div>
        </Card.Content>
      </Card.Root>

      <Button class="mb-5" on:click={clearResults}>Clear List</Button>
      <ScrollArea class="h-[calc(100vh_-_520px)] w-full pl-5 pr-5 rounded-md border">
        <VideoList {videos}></VideoList>
      </ScrollArea>
    </Tabs.Content>
    <Tabs.Content value="functions">
      <ScrollArea class="h-[calc(100vh_-_270px)]">
      <Card.Root class="m-4 p-4 mr-20  w-[calc(100vw_-_125px)]">
        <Card.Header>
          <Card.Title>GetVersionTag</Card.Title>
          <Card.Description>returns a string that is the "version" tag of the file.</Card.Description>
        </Card.Header>
        <Card.Content>
          <pre class="text-xs p-2 bg-muted overflow-x-auto">{functions.gvtt}</pre>
        </Card.Content>
      </Card.Root>
      <Card.Root class="m-4 p-4 mr-20 w-[calc(100vw_-_125px)]">
        <Card.Header>
          <Card.Title>GetFileKey</Card.Title>
          <Card.Description>returns a string that is the "key" for all versions of this file.</Card.Description>
        </Card.Header>
        <Card.Content >
          <pre class="text-xs p-2 bg-muted overflow-x-auto">{functions.gfkt}</pre>
        </Card.Content>
      </Card.Root>
      <Card.Root class="m-4 p-4 mr-20 w-[calc(100vw_-_125px)]">
        <Card.Header>
          <Card.Title>GetUserData</Card.Title>
          <Card.Description>returns an object containing properties that are to be used in rules.</Card.Description>
        </Card.Header>
        <Card.Content>
          <pre class="text-xs p-2 bg-muted overflow-x-auto">{functions.gudt}</pre>
        </Card.Content>
      </Card.Root>
    </ScrollArea>
    </Tabs.Content>
  </Tabs.Root>
</main>

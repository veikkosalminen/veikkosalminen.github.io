# install

 - install ngrok
```
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok
```
```
ngrok config add-authtoken 6JaJw6u64DHWykJTpiXLn_2VLaGCvGq89KLebBskjMe
```

 - install node
```
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
```
```
sudo apt install nodejs
```

 - run everything
```
./run
```


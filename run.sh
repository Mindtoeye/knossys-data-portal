#clear

which curl &> /dev/null

if [[ $? = 0 ]]; then
  curl https://knossys.com/banner.txt
fi

if [ ! -d "node_modules" ]; then
  echo "Error: no node_modules folder found, please execute 'run-prep.sh first"
  exit
fi

echo "Starting websocket server ..."

cd dist
node bundle.js
cd ..

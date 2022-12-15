clear
rm -rf ./dist/*
#export NODE_OPTIONS=--openssl-legacy-provider
npm run buildnpm
npm publish --access=public

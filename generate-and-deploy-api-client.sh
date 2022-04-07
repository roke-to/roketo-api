#!/bin/sh

echo "⭐ Generate swagger.json"
yarn
GENERATE_SWAGGER_JSON=true yarn start

echo "⭐ Clone client repo"
rm -rf roketo-api-client
git clone --depth 1 git@github.com:roke-to/roketo-api-client.git

echo "⭐ Regenerate client"
cd roketo-api-client
CURRENT_VERSION=$(grep -Po "(?<=version\": \")\d+\.\d+\.\d+" package.json)
npx openapi-generator-cli generate -i ../swagger.json -g typescript --additional-properties=npmName=@roketo/api-client,npmVersion=$CURRENT_VERSION,projectName=@roketo/api-client
echo node_modules > .gitignore
yarn

echo "⭐ Commit changes, bump version and push"
if [ "$CI" ]; then
  git config user.name github-actions
  git config user.email github-actions@github.com
fi
git add --all
git commit -m "Regenerate API"
yarn version --patch
git push origin main --follow-tags

echo "⭐ Clean up"
cd ..
rm swagger.json
rm -rf roketo-api-client

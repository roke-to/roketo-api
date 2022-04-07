#!/bin/sh

# Generate swagger.json
yarn
GENERATE_SWAGGER_JSON=true yarn start

# Clone client repo
rm -rf roketo-api-client
git clone --depth 1 git@github.com:roke-to/roketo-api-client.git

# Regenerate client
cd roketo-api-client
CURRENT_VERSION=$(grep -Po "(?<=version\": \")\d+\.\d+\.\d+" package.json)
npx openapi-generator-cli generate -i ../swagger.json -g typescript --additional-properties=npmName=@roketo/api-client,npmVersion=$CURRENT_VERSION,projectName=@roketo/api-client
echo node_modules > .gitignore
yarn

# Commit changes, bump version and push
git add --all
git commit -m "Regenerate API"
yarn version --patch
git push origin main --follow-tags

# Clean
cd ..
rm swagger.json
rm -rf roketo-api-client

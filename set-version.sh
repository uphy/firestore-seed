#!/bin/bash

if [ $# != 1 ]; then
  echo Specify version.
  exit 1
fi
VERSION=$1

function update_version(){
    local file=$1
    sed -i "" -e "s/firestore-seed\": \".*\"/firestore-seed\": \"^$VERSION\"/" "$file"
    pushd . > /dev/null
    yarn install
}

export -f update_version
export VERSION
find examples -maxdepth 2 -name "package.json" | xargs -I% sh -c 'update_version "%"'
sed -i "" -e "s/\"version\": \".*\",/\"version\": \"$VERSION\",/" package.json
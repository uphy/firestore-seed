#!/bin/bash

if [ $# != 1 ]; then
  echo Specify version.
  echo "Usage: ./set-version 0.0.8"
  echo "       INSTALL=1 ./set-version 0.0.8"
  exit 1
fi
VERSION=$1
INSTALL=${INSTALL:=0}

function update_version(){
    local file=$1
    sed -i "" -e "s/firestore-seed\": \".*\"/firestore-seed\": \"^$VERSION\"/" "$file"
    if [ $INSTALL == 1 ]; then
      pushd . > /dev/null
      cd "$(dirname $file)"
      yarn install
      popd > /dev/null
    fi
}

export -f update_version
export VERSION
export INSTALL
find examples -maxdepth 2 -name "package.json" | xargs -I% sh -c 'update_version "%"'
sed -i "" -e "s/\"version\": \".*\",/\"version\": \"$VERSION\",/" package.json
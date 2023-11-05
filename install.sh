#!/bin/bash

source_directory="./app"
destination_directory="/opt/discord/resources"

if [ -f "$destination_directory/app.asar" ]; then
    sudo mv "$destination_directory/app.asar" "$destination_directory/original.asar"
fi

if [ -f "$destination_directory/app" ]; then
    sudo rm -r "$destination_directory/app"
fi

sudo cp -r "$source_directory" "$destination_directory"
#!/bin/bash

# Variables

# Récupère le chemin du script
SCRIPT_PATH="$( cd "$(dirname "$0")" || exit ; pwd -P )"

# Variables
LOCAL_PROJECT_PATH="$SCRIPT_PATH"  # Utilisez le chemin du script comme chemin du projet local
REMOTE_USER="coyi9848"
REMOTE_HOST="runningtools.fr"
REMOTE_PORT="22"
REMOTE_PATH="/home/coyi9848/runningTools.fr"  # Remplacez par le chemin sur votre hébergeur

# Build du projet
echo "Build du projet..."
cd "$LOCAL_PROJECT_PATH" || exit
git checkout develop
npm install  # ou yarn install, en fonction de votre gestionnaire de paquets
npm run build  # ou la commande que vous utilisez pour construire votre projet
echo "Build terminé."

# Transfert via SSH avec suppression et remplacement
echo "Début de la synchronisation avec le serveur distant..."
rsync -avz --exclude 'node_modules' "$LOCAL_PROJECT_PATH"/dist/ -e "ssh -p $REMOTE_PORT" $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH
echo "Synchronisation terminée."

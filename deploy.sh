#!/bin/bash

# Variables

# Récupère le chemin du script
SCRIPT_PATH="$( cd "$(dirname "$0")" || exit ; pwd -P )"

# Variables
LOCAL_PROJECT_PATH="$SCRIPT_PATH"  # Utilisez le chemin du script comme chemin du projet local
REMOTE_USER="u245063369"
REMOTE_HOST="62.72.37.253"
REMOTE_PORT="65002"
REMOTE_PATH="/home/u245063369/domains/runningtools.fr/public_html"  # Remplacez par le chemin sur votre hébergeur

# Build du projet
echo "Build du projet..."
cd "$LOCAL_PROJECT_PATH" || exit
git checkout develop
npm install  # ou yarn install, en fonction de votre gestionnaire de paquets
npm run build  # ou la commande que vous utilisez pour construire votre projet
echo "Build terminé."

# Transfert via SSH avec suppression et remplacement
echo "Début de la synchronisation avec le serveur distant..."
rsync -avz --delete --exclude 'node_modules' $LOCAL_PROJECT_PATH/dist/ -e "ssh -p $REMOTE_PORT" $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH
echo "Synchronisation terminée."

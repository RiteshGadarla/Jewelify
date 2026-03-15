#!/bin/bash
# Jewelify - Virtual Environment Activation Helper
# Note: This script MUST be sourced to affect your current shell:
# Usage: source scripts/activate.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="$SCRIPT_DIR/../api/model/venv/bin/activate"

if [ -f "$VENV_PATH" ]; then
    source "$VENV_PATH"
    echo "✅ Jewelify virtual environment activated."
else
    echo "❌ Virtual environment not found at $VENV_PATH"
    echo "Please run ./scripts/setup.sh first."
fi

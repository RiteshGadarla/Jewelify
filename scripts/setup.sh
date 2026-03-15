#!/usr/bin/env bash
# =============================================================================
# Jewelify — Python Environment Setup Script
# =============================================================================
# Usage:
#   ./scripts/setup.sh           — Install full ML stack (actual mode)
#   ./scripts/setup.sh --dev     — Install minimal deps (dev mode only)
#
# This script:
#   1. Creates a Python virtual environment in api/model/venv/
#   2. Activates the virtual environment
#   3. Installs the appropriate requirements file
#   4. Generates placeholder images in api/model/mock_images/ (if missing)
# =============================================================================

set -e  # Exit immediately on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MODEL_DIR="$PROJECT_ROOT/api/model"
VENV_DIR="$MODEL_DIR/venv"
MOCK_IMAGES_DIR="$MODEL_DIR/mock_images"

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
DEV_MODE=false
for arg in "$@"; do
  case $arg in
    --dev) DEV_MODE=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# Step 1 — Create virtual environment (if it doesn't already exist)
# ---------------------------------------------------------------------------
echo ""
echo "🔧 [Jewelify Setup] Creating Python virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    echo "   ✅ Virtual environment created at: $VENV_DIR"
else
    echo "   ℹ️  Virtual environment already exists at: $VENV_DIR (skipping)"
fi

# ---------------------------------------------------------------------------
# Step 2 — Activate virtual environment
# ---------------------------------------------------------------------------
echo ""
echo "🔧 [Jewelify Setup] Activating virtual environment..."
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
echo "   ✅ Virtual environment activated."

# ---------------------------------------------------------------------------
# Step 3 — Install Python dependencies
# ---------------------------------------------------------------------------
echo ""
if [ "$DEV_MODE" = true ]; then
    echo "🔧 [Jewelify Setup] Installing MINIMAL development dependencies..."
    echo "   (No ML frameworks — suitable for dev mode only)"
    pip install --quiet --upgrade pip
    pip install -r "$MODEL_DIR/requirements-dev.txt"
    echo "   ✅ Minimal dependencies installed."
else
    echo "🔧 [Jewelify Setup] Installing FULL ML stack dependencies..."
    echo "   (This may take several minutes and use several GB of disk space)"
    pip install --quiet --upgrade pip
    pip install -r "$MODEL_DIR/requirements.txt"
    echo "   ✅ Full ML stack installed."
fi

# ---------------------------------------------------------------------------
# Step 4 — Generate placeholder mock images (if missing)
# ---------------------------------------------------------------------------
echo ""
echo "🔧 [Jewelify Setup] Checking mock_images directory..."
mkdir -p "$MOCK_IMAGES_DIR"

# Count existing images
IMG_COUNT=$(find "$MOCK_IMAGES_DIR" -maxdepth 1 \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l)

if [ "$IMG_COUNT" -lt 3 ]; then
    echo "   Generating placeholder jewelry images for development mode..."
    python3 - <<'PYEOF'
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'api', 'model'))
from PIL import Image, ImageDraw, ImageFont
import random

mock_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'api', 'model', 'mock_images')
os.makedirs(mock_dir, exist_ok=True)

labels = [
    ("mock_necklace.jpg",   "💎 Diamond Necklace",      (212, 175, 55)),
    ("mock_ring.jpg",       "💍 Gold Ring",              (218, 165, 32)),
    ("mock_bracelet.jpg",   "✨ Platinum Bracelet",      (192, 192, 192)),
    ("mock_earring.jpg",    "🌟 Ruby Earring",           (185, 50, 50)),
    ("mock_pendant.jpg",    "💠 Sapphire Pendant",       (48, 86, 170)),
]

for filename, label, color in labels:
    path = os.path.join(mock_dir, filename)
    if os.path.exists(path):
        continue
    img = Image.new("RGB", (512, 512), color=(30, 30, 30))
    draw = ImageDraw.Draw(img)
    # Draw a simple decorative circles to suggest jewelry
    for r in [220, 190, 160]:
        draw.ellipse([256-r, 256-r, 256+r, 256+r], outline=color, width=3)
    # Draw a center gem suggestion
    draw.ellipse([216, 216, 296, 296], fill=color, outline=(255, 255, 255), width=2)
    draw.text((80, 460), f"[DEV] {label}", fill=(200, 200, 200))
    img.save(path, "JPEG", quality=85)
    print(f"   Created: {filename}")

print("   ✅ Placeholder mock images generated.")
PYEOF
else
    echo "   ✅ Mock images already present ($IMG_COUNT found). Skipping generation."
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "============================================================"
echo " ✅ Jewelify setup complete!"
echo "============================================================"
echo ""
if [ "$DEV_MODE" = true ]; then
    echo " To run the Flask server in DEVELOPMENT mode:"
    echo "   source $VENV_DIR/bin/activate"
    echo "   cd api/model && python app.py --mode dev"
    echo ""
    echo " Or from project root:"
    echo "   npm run dev"
else
    echo " To run the Flask server in ACTUAL mode:"
    echo "   source $VENV_DIR/bin/activate"
    echo "   cd api/model && python app.py --mode actual"
    echo ""
    echo " Or from project root:"
    echo "   npm run actual"
fi
echo ""
echo " To run in DEVELOPMENT mode without the ML stack:"
echo "   ./scripts/setup.sh --dev"
echo "============================================================"

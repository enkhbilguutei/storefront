#!/bin/bash

# QR Code Generator for Mobile Development
# Generates QR codes for quick mobile access to dev servers

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Get local IP
get_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost"
    else
        hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost"
    fi
}

# Generate QR code using qrencode if available
generate_qr() {
    local url=$1
    local label=$2
    
    if command -v qrencode &> /dev/null; then
        echo ""
        echo "$label"
        echo "$url"
        qrencode -t ANSIUTF8 "$url"
    else
        # Fallback to online service
        local encoded_url=$(echo "$url" | sed 's/:/%3A/g; s|/|%2F|g')
        echo ""
        echo "$label"
        echo "$url"
        echo ""
        echo "Online QR Code:"
        echo "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded_url}"
        echo ""
        print_info "Scan this URL to generate a QR code, or install qrencode:"
        print_info "  brew install qrencode  (macOS)"
        print_info "  apt install qrencode   (Linux)"
    fi
}

main() {
    LOCAL_IP=$(get_ip)
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📱 Mobile Access QR Codes"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$LOCAL_IP" == "localhost" ]; then
        print_warning "Could not detect local IP address"
        print_info "Please run this script after running 'pnpm mobile:setup'"
        exit 1
    fi
    
    STOREFRONT_URL="http://${LOCAL_IP}:3001"
    BACKEND_URL="http://${LOCAL_IP}:9000"
    ADMIN_URL="http://${LOCAL_IP}:9000/app"
    
    case "${1:-all}" in
        storefront|store|s)
            generate_qr "$STOREFRONT_URL" "🛍️  Storefront"
            ;;
        backend|api|b)
            generate_qr "$BACKEND_URL" "🔧 Backend API"
            ;;
        admin|a)
            generate_qr "$ADMIN_URL" "⚙️  Admin Panel"
            ;;
        all|*)
            generate_qr "$STOREFRONT_URL" "🛍️  Storefront"
            echo ""
            generate_qr "$ADMIN_URL" "⚙️  Admin Panel"
            ;;
    esac
    
    echo ""
    print_success "Scan the QR code(s) with your mobile device"
    echo ""
}

main "$@"

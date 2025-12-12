#!/bin/bash

# Mobile Development Setup Script
# Configures local development servers for mobile device access

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Get local IP address
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
    else
        # Linux
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
    fi
    
    if [ -z "$LOCAL_IP" ]; then
        print_error "Could not detect local IP address"
        print_info "Please manually enter your local IP address:"
        read -r LOCAL_IP
    fi
    
    echo "$LOCAL_IP"
}

# Backup function
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
        print_success "Backed up $file"
    fi
}

# Update backend .env
update_backend_env() {
    local ip=$1
    local env_file="backend/.env"
    
    if [ ! -f "$env_file" ]; then
        print_error "Backend .env file not found"
        return 1
    fi
    
    backup_file "$env_file"
    
    # Update CORS settings
    # Keep localhost:3000 for desktop dev; use a separate port for mobile access.
    local mobile_storefront_port="3001"
    local store_cors="http://localhost:8000,http://localhost:3000,http://${ip}:${mobile_storefront_port},https://docs.medusajs.com"
    local admin_cors="http://localhost:5173,http://localhost:9000,http://${ip}:9000,https://docs.medusajs.com"
    local auth_cors="http://localhost:5173,http://localhost:9000,http://localhost:8000,http://localhost:3000,http://${ip}:${mobile_storefront_port},http://${ip}:9000"
    
    # Update or add STORE_CORS
    if grep -q "^STORE_CORS=" "$env_file"; then
        sed -i.tmp "s|^STORE_CORS=.*|STORE_CORS=${store_cors}|" "$env_file"
    else
        echo "STORE_CORS=${store_cors}" >> "$env_file"
    fi
    
    # Update or add ADMIN_CORS
    if grep -q "^ADMIN_CORS=" "$env_file"; then
        sed -i.tmp "s|^ADMIN_CORS=.*|ADMIN_CORS=${admin_cors}|" "$env_file"
    else
        echo "ADMIN_CORS=${admin_cors}" >> "$env_file"
    fi
    
    # Update or add AUTH_CORS
    if grep -q "^AUTH_CORS=" "$env_file"; then
        sed -i.tmp "s|^AUTH_CORS=.*|AUTH_CORS=${auth_cors}|" "$env_file"
    else
        echo "AUTH_CORS=${auth_cors}" >> "$env_file"
    fi
    
    # Update or add MEDUSA_BACKEND_URL
    if grep -q "^MEDUSA_BACKEND_URL=" "$env_file"; then
        sed -i.tmp "s|^MEDUSA_BACKEND_URL=.*|MEDUSA_BACKEND_URL=http://${ip}:9000|" "$env_file"
    else
        echo "MEDUSA_BACKEND_URL=http://${ip}:9000" >> "$env_file"
    fi
    
    # Clean up temp files
    rm -f "$env_file.tmp"
    
    print_success "Updated backend/.env with mobile CORS settings"
}

# Update storefront .env.local
update_storefront_env() {
    local ip=$1
    local env_file="storefront/.env.local"
    local mobile_storefront_port="3001"
    
    if [ ! -f "$env_file" ]; then
        print_warning "Storefront .env.local not found, creating..."
        touch "$env_file"
    else
        backup_file "$env_file"
    fi
    
    # Update or add NEXT_PUBLIC_MEDUSA_BACKEND_URL
    if grep -q "^NEXT_PUBLIC_MEDUSA_BACKEND_URL=" "$env_file"; then
        sed -i.tmp "s|^NEXT_PUBLIC_MEDUSA_BACKEND_URL=.*|NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://${ip}:9000|" "$env_file"
    else
        echo "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://${ip}:9000" >> "$env_file"
    fi
    
    # Update or add NEXTAUTH_URL
    if grep -q "^NEXTAUTH_URL=" "$env_file"; then
        sed -i.tmp "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=http://${ip}:${mobile_storefront_port}|" "$env_file"
    else
        echo "NEXTAUTH_URL=http://${ip}:${mobile_storefront_port}" >> "$env_file"
    fi
    
    # Clean up temp files
    rm -f "$env_file.tmp"
    
    print_success "Updated storefront/.env.local with mobile backend URL"
}

# Restore local development settings
restore_local_env() {
    print_info "Restoring local development settings..."
    
    # Backend
    local backend_env="backend/.env"
    if [ -f "$backend_env" ]; then
        backup_file "$backend_env"
        
        sed -i.tmp "s|^STORE_CORS=.*|STORE_CORS=http://localhost:8000,http://localhost:3000,https://docs.medusajs.com|" "$backend_env"
        sed -i.tmp "s|^ADMIN_CORS=.*|ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com|" "$backend_env"
        sed -i.tmp "s|^AUTH_CORS=.*|AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:8000,http://localhost:3000|" "$backend_env"
        sed -i.tmp "s|^MEDUSA_BACKEND_URL=.*|MEDUSA_BACKEND_URL=http://localhost:9000|" "$backend_env"
        
        rm -f "$backend_env.tmp"
        print_success "Restored backend/.env"
    fi
    
    # Storefront
    local storefront_env="storefront/.env.local"
    if [ -f "$storefront_env" ]; then
        backup_file "$storefront_env"
        
        sed -i.tmp "s|^NEXT_PUBLIC_MEDUSA_BACKEND_URL=.*|NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000|" "$storefront_env"
        sed -i.tmp "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=http://localhost:3000|" "$storefront_env"
        
        rm -f "$storefront_env.tmp"
        print_success "Restored storefront/.env.local"
    fi
    
    print_success "Local development settings restored"
    print_warning "Please restart your dev servers for changes to take effect"
}

# Check if servers are running
check_servers() {
    local backend_running=false
    local frontend_running=false
    
    if lsof -Pi :9000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        backend_running=true
    fi
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        frontend_running=true
    fi

    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        frontend_running=true
    fi
    
    if [ "$backend_running" = true ] || [ "$frontend_running" = true ]; then
        print_warning "Development servers are currently running"
        print_info "For changes to take effect, you need to restart them after setup"
        echo ""
    fi
}

# Main script
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📱 Alimhan Mobile Development Setup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    case "${1:-setup}" in
        setup)
            check_servers
            print_info "Detecting local IP address..."
            LOCAL_IP=$(get_local_ip)
            print_success "Local IP: $LOCAL_IP"
            echo ""
            
            print_info "Updating environment files for mobile access..."
            update_backend_env "$LOCAL_IP"
            update_storefront_env "$LOCAL_IP"
            echo ""
            
            print_success "Mobile development setup complete!"
            echo ""
            print_info "Access your development servers from mobile:"
            echo "  • Storefront (mobile): ${BLUE}http://${LOCAL_IP}:3001${NC}"
            echo "  • Backend API: ${BLUE}http://${LOCAL_IP}:9000${NC}"
            echo "  • Admin: ${BLUE}http://${LOCAL_IP}:9000/app${NC}"
            echo ""
            print_warning "Next steps:"
            echo "  1. Make sure your mobile device is on the same WiFi network"
            echo "  2. Start desktop dev: ${BLUE}pnpm dev${NC} (localhost:3000)"
            echo "  3. Start mobile dev:  ${BLUE}pnpm dev:mobile${NC} (IP:3001)"
            echo "  4. Open ${BLUE}http://${LOCAL_IP}:3001${NC} on your mobile browser"
            echo ""
            print_info "To restore local-only settings, run: ${BLUE}./scripts/mobile-dev.sh restore${NC}"
            ;;
            
        restore)
            restore_local_env
            ;;
            
        ip)
            LOCAL_IP=$(get_local_ip)
            echo "$LOCAL_IP"
            ;;
            
        help|--help|-h)
            echo "Usage: ./scripts/mobile-dev.sh [command]"
            echo ""
            echo "Commands:"
            echo "  setup    Configure environment for mobile development (default)"
            echo "  restore  Restore localhost-only configuration"
            echo "  ip       Print local IP address only"
            echo "  help     Show this help message"
            echo ""
            ;;
            
        *)
            print_error "Unknown command: $1"
            echo "Run './scripts/mobile-dev.sh help' for usage information"
            exit 1
            ;;
    esac
    
    echo ""
}

main "$@"

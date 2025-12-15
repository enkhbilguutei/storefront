# Bento Banners Guide

## Overview
Bento banners are CMS-manageable promotional banners displayed on the homepage. Admins can upload and manage these banners through the admin panel with support for separate desktop and mobile images.

## Banner Specifications

### Desktop Banner
- **Aspect Ratio**: 16:5 (wide banner)
- **Recommended Size**: 1600×500px
- **Display**: Shown on screens larger than 768px (tablets and desktops)
- **Format**: JPG, PNG, WebP (Cloudinary will optimize automatically)

### Mobile Banner
- **Aspect Ratio**: 3:4 (vertical banner)
- **Recommended Size**: 800×1067px
- **Display**: Shown on mobile devices (screens smaller than 768px)
- **Format**: JPG, PNG, WebP (Cloudinary will optimize automatically)

## How to Add a Bento Banner

1. **Navigate to Banners**
   - Go to Admin Panel → Banners
   
2. **Create New Banner**
   - Click the "Нэмэх" (Add) button
   
3. **Select Banner Type**
   - Choose "Бенто баннер (16:5)" from the placement dropdown
   - This will show you the recommended image sizes
   
4. **Upload Images**
   - **Desktop Image**: Drag and drop or click to upload (16:5 aspect ratio)
   - **Mobile Image**: Upload a separate mobile version (3:4 aspect ratio)
   - If no mobile image is provided, the desktop image will be used on mobile
   
5. **Add Details**
   - **Title**: Optional banner title
   - **Subtitle**: Optional subtitle
   - **Link**: URL where the banner should navigate (e.g., `/products/macbook`)
   - **Alt Text**: Alternative text for accessibility
   
6. **Settings**
   - **Sort Order**: Lower numbers appear first (if multiple banners exist)
   - **Active**: Toggle to enable/disable the banner
   - **Dark Text**: Toggle if banner text should be dark (for light backgrounds)
   
7. **Save**
   - Click "Үүсгэх" (Create) to publish the banner

## Image Requirements

### Desktop Banner (16:5)
```
Minimum: 1200×375px
Recommended: 1600×500px
Maximum: 2400×750px
```

### Mobile Banner (3:4)
```
Minimum: 600×800px
Recommended: 800×1067px
Maximum: 1200×1600px
```

### File Size
- Keep images under 2MB for optimal performance
- Cloudinary will automatically compress and optimize

### File Formats
- JPG/JPEG: Best for photos
- PNG: Best for graphics with transparency
- WebP: Modern format with excellent compression

## Design Tips

### Desktop Banner (16:5)
- Place important content in the center (safe zone)
- Avoid text near edges (may be cropped on smaller screens)
- Use high-contrast text for readability
- Consider the 16:5 wide format for landscape-oriented imagery

### Mobile Banner (3:4)
- Design separately from desktop for best results
- Stack text vertically
- Use portrait-oriented imagery
- Ensure CTA buttons are thumb-friendly (min 44×44px)

## Image Cropping

The system uses **object-cover** which means:
- Images will fill the entire space
- Images maintain their aspect ratio
- Images may be cropped to fit (center focus)
- Any size image can be uploaded - it will auto-crop

### Example:
If you upload a 2000×1000px image for desktop:
- System expects 16:5 (approximately 1600×500)
- Your 2000×1000 is 2:1 ratio
- Image will be center-cropped to 16:5
- Some top/bottom content may be cut

**Best Practice**: Upload images at the exact recommended dimensions.

## Managing Multiple Banners

### Display Logic
- Only the **first active** banner is shown on the homepage
- Banners are sorted by `sort_order` (ascending)
- Only active banners with valid dates are displayed

### A/B Testing
To test different banners:
1. Create multiple bento banners with the same sort_order
2. Toggle `is_active` to switch between them
3. Monitor performance to see which performs better

### Scheduling (Optional)
- **Starts At**: Banner becomes active at this date/time
- **Ends At**: Banner becomes inactive at this date/time
- Leave empty for always-active banners

## Cloudinary Integration

All banner images are stored in Cloudinary with these benefits:
- Automatic format optimization (WebP when supported)
- Responsive image sizing
- CDN delivery for fast loading
- Image transformations on-the-fly

### Cloudinary URLs
The system supports:
- Direct Cloudinary URLs: `https://res.cloudinary.com/...`
- Public IDs: `banner/promo-macbook`
- External URLs: `https://example.com/image.jpg`

## Troubleshooting

### Banner Not Appearing
1. Check if banner is **active** (toggle in admin)
2. Verify **date range** (starts_at/ends_at)
3. Check **sort_order** (lower = higher priority)
4. Ensure **image_url** is valid
5. Clear browser cache (banners are cached for 60 seconds)

### Image Quality Issues
1. Upload higher resolution images
2. Use recommended dimensions
3. Avoid over-compression before upload
4. Use appropriate format (JPG for photos, PNG for graphics)

### Mobile Banner Not Showing
1. Upload a separate **mobile_image_url**
2. If not provided, desktop image is used
3. Test on actual mobile device or browser dev tools

## API Endpoints

For developers integrating with the banner system:

### Get Bento Banners
```
GET /store/banners?placement=bento
```

Response:
```json
{
  "banners": [
    {
      "id": "banner_123",
      "title": "MacBook Pro M4",
      "image_url": "https://res.cloudinary.com/.../desktop.jpg",
      "mobile_image_url": "https://res.cloudinary.com/.../mobile.jpg",
      "link": "/products/macbook-pro",
      "placement": "bento",
      "is_active": true
    }
  ]
}
```

### Cache Behavior
- Banners are cached for **60 seconds** (ISR)
- Changes may take up to 1 minute to appear on the storefront
- Force refresh: Clear Next.js cache or wait 60 seconds

## Best Practices

1. **Always upload both desktop and mobile images** for best user experience
2. **Use high-quality images** (Cloudinary will optimize)
3. **Keep file sizes reasonable** (<2MB per image)
4. **Test on multiple devices** before going live
5. **Use descriptive alt text** for accessibility
6. **Link to relevant pages** (product pages, collections, campaigns)
7. **Update regularly** to keep content fresh
8. **A/B test different designs** to optimize conversions
9. **Schedule seasonal banners** using starts_at/ends_at
10. **Monitor performance** through analytics

## Example Workflow

### Promoting a New Product Launch

1. **Design Phase**
   - Create desktop banner: 1600×500px (16:5)
   - Create mobile banner: 800×1067px (3:4)
   - Ensure branding consistency

2. **Upload**
   - Go to Admin → Banners → New
   - Select "Бенто баннер"
   - Upload both images
   - Add link to product page

3. **Schedule**
   - Set starts_at to launch date
   - Set ends_at to end of campaign
   - Mark as active

4. **Monitor**
   - Check banner appears correctly
   - Track clicks and conversions
   - Adjust if needed

5. **Cleanup**
   - After campaign ends, banner auto-deactivates
   - Keep for future reference or delete

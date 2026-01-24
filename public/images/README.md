# Zcloths Image Assets

This folder contains all images for the Zcloths app. Simply add your images to the appropriate folders and hot reload the app.

## 📁 Folder Structure

```
assets/images/
├── banners/          # Hero banners, promotional images
│   ├── hero.jpg      # Main hero banner (recommended: 1080x1920)
│   └── promo.jpg     # Sale/promo banner (recommended: 400x320)
│
├── products/         # Individual product photos
│   ├── kurta_1.jpg   # Product images (recommended: 800x1000)
│   ├── sherwani_1.jpg
│   ├── jacket_1.jpg
│   └── dhoti_1.jpg
│
├── categories/       # Category thumbnails
│   ├── kurtas.jpg    # Category images (recommended: 200x200)
│   ├── sherwanis.jpg
│   ├── blazers.jpg
│   ├── dhotis.jpg
│   └── jackets.jpg
│
├── collections/      # Collection cover images
│   ├── wedding.jpg   # Collection covers (recommended: 360x400)
│   ├── festival.jpg
│   └── office.jpg
│
└── icons/            # Custom icons (if needed)
```

## 🖼️ Image Guidelines

| Type | Recommended Size | Format |
|------|-----------------|--------|
| Hero Banner | 1080 x 1920 px | JPG/PNG |
| Promo Banner | 400 x 320 px | JPG/PNG |
| Products | 800 x 1000 px | JPG/PNG |
| Categories | 200 x 200 px | JPG/PNG |
| Collections | 360 x 400 px | JPG/PNG |

## ✅ After Adding Images

1. Save your images in the correct folder
2. Run `flutter pub get` (if needed)
3. Hot reload the app (press `r` in terminal or save any dart file)

## 📝 Notes

- Use JPG for photos (smaller file size)
- Use PNG for images with transparency
- Keep file sizes optimized for mobile (< 500KB per image ideally)
- Use lowercase filenames with underscores (e.g., `silk_kurta_1.jpg`)

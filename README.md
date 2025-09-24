# ImageCraft

![HomePage](./assets/home_page.png)

An advanced real time web application using **GPU** for editing, enhancing, and sharing images.  
Built with **React (Vite)** on the frontend and **Flask** on the backend, with cloud storage using Cloudinary and subscription-based payment with **Stripe**.

You can find the project demo [here](https://pixeltune-theta.vercel.app/). As it is a free service, backend may not work.

---

## ✨ Features

### 🔑 Authentication

- Email/password signup & login
- Google OAuth login
- JWT-based authentication

### 🖌️ Image Editing Tools

- Supports Any Image Size From Local Disk, Online URL, Canvas JSON File
- Adjust Colors, Details of the image
- Custom Preset Filters
- Reflect, Swirl, Bulge/Pinch Filters, Histogram Equalization, Contrast Stretching
- Add **text** and **shapes**
- Preset Text Templates
- **Crop** and **resize**
- **Style transfer** (with templates & any image)
- **Super resolution** (upscaling)
- **Undo/Redo Feature**

<div align="center">
  <img src="./assets/edit.png" alt="Editing Page" width="600">
  <p>Figure: Main Editing Page</p>
</div>

<div align="center">
  <img src="./assets/filters.png" alt="Color Filters" width="600">
  <p>Figure: Color Filters</p>
</div>

<div align="center">
  <img src="./assets/style_transfer.png" alt="Style Transfer" width="600">
  <p>Figure: Style Transfer</p>
</div>

<div align="center">
  <img src="./assets/super_resolution.png" alt="Super Resolution" width="600">
  <p>Figure: 2X, 3X, 4X Super Resolution</p>
</div>

### 📊 User Dashboard

- Users Projects
- Bookmarks
- Manage Subscriptions
- Reports & Notices
- Access Project Information Dashboard

<div align="center">
  <img src="./assets/profile.png" alt="Profile Page" width="600">
  <p>Figure: Profile Page</p>
</div>

<div align="center">
  <img src="./assets/dashboard.png" alt="Project Dashboard" width="600">
  <p>Figure: Project Dashboard</p>
</div>

### 📸 Gallery

- Share edited images with the community
- Sort by **bookmarks** and **views**
- **Like** / **rate** images
- **Report** inappropriate content
- Pagination

<div align="center">
  <img src="./assets/gallery.png" alt="Gallery" width="600">
  <p>Figure: Gallery</p>
</div>

**TODO**: **Find similar images using semantic search**

### 👨‍💻 Admin Dashboard

- Review and manage reported images
- Manage Admins
- Add New Text and Style Transfer Templates

<div align="center">
  <img src="./assets/admin.png" alt="Admin Management" width="600">
  <p>Figure: Admin Management</p>
</div>

<div align="center">
  <img src="./assets/admin_text.png" alt="Add Templates" width="600">
  <p>Figure: Add Templates</p>
</div>

### 💳 Subscription System

- **Stripe integration** for subscription plans
- Webhooks to:
  - Update subscription plans
  - Subscription Cancellations
  - Reset user quotas (`style_completion` and `upscale_completion`)

<div align="center">
  <img src="./assets/pricing.png" alt="Pricing" width="600">
  <p>Figure: Pricing</p>
</div>

<div align="center">
  <img src="./assets/stripe.png" alt="Stripe Subscription" width="600">
  <p>Figure: Stripe Subscription</p>
</div>

<div align="center">
  <img src="./assets/current_plan.png" alt="Current Plan" width="600">
  <p>Figure: Current Plan</p>
</div>

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Fabric.js, WebGL
- **Backend:** Flask
- **Database:** MongoDB
- **Storage:** Cloudinary
- **Auth:** JWT + Google OAuth
- **Payments:** Stripe
- **Deployment:** Vercel, Render

<br>

# LICENSE

[MIT LICENSE](LICENSE)

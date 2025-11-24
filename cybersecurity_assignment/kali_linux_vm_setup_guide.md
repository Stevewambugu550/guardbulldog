# Kali Linux VM Setup Guide

## Complete Step-by-Step Instructions for Your Assignment

---

## Option 1: Using VirtualBox (Recommended - Free & Easy)

### Step 1: Download VirtualBox
1. Go to: https://www.virtualbox.org/wiki/Downloads
2. Click **"Windows hosts"** to download the installer
3. Run the installer and follow the setup wizard (use default settings)

### Step 2: Download Kali Linux VM Image
1. Go to: https://www.kali.org/get-kali/#kali-virtual-machines
2. Scroll to **"Virtual Machines"** section
3. Download **"VirtualBox 64-bit (OVA)"** - this is pre-configured
4. File size is ~3-4GB, so it may take some time

### Step 3: Import Kali Linux into VirtualBox
1. Open VirtualBox
2. Click **File → Import Appliance**
3. Click the folder icon and select the downloaded `.ova` file
4. Click **Next**
5. Review settings (default is fine) and click **Import**
6. Wait 5-10 minutes for import to complete

### Step 4: Start Kali Linux
1. Select **"Kali Linux"** from the list
2. Click the green **Start** arrow
3. Wait for Kali to boot (1-2 minutes)
4. **Default Login Credentials:**
   - Username: `kali`
   - Password: `kali`

### Step 5: Take Screenshot for Assignment
1. Once logged in, press **Windows Key + Shift + S**
2. Select the area showing the Kali Linux desktop
3. Screenshot is copied to clipboard
4. Open Paint or Word and paste (Ctrl+V)
5. Save as: `kali_linux_vm_screenshot.png`

---

## Option 2: Using VMWare Workstation Player (Alternative)

### Step 1: Download VMWare Workstation Player
1. Go to: https://www.vmware.com/products/workstation-player.html
2. Click **"Download For Free"**
3. Select Windows version
4. Install with default settings

### Step 2: Download Kali Linux for VMWare
1. Go to: https://www.kali.org/get-kali/#kali-virtual-machines
2. Download **"VMware 64-bit (7z)"**
3. Extract the 7z file using 7-Zip (download from https://www.7-zip.org/ if needed)

### Step 3: Open in VMWare
1. Open VMWare Workstation Player
2. Click **"Open a Virtual Machine"**
3. Navigate to extracted folder and select the `.vmx` file
4. Click **Open**

### Step 4: Start and Screenshot
1. Click **"Play virtual machine"**
2. Login with credentials: `kali` / `kali`
3. Take screenshot using Windows Key + Shift + S
4. Save the screenshot

---

## Option 3: Using CBGS 3206 Lab VM (If Available)

### If Your Course Provides Access:
1. Log into the CBGS 3206 lab environment
2. Access the pre-configured Kali Linux VM
3. Start the VM
4. Take a screenshot showing:
   - Kali Linux desktop
   - Terminal window (optional but recommended)
   - Your username or system info visible
5. Save and upload the screenshot

---

## What Should Be Visible in Your Screenshot?

Your screenshot should clearly show:
- ✅ **Kali Linux desktop** with the dragon logo wallpaper
- ✅ **Top menu bar** showing "Kali Linux"
- ✅ **Terminal window** (open one to prove it's running)
- ✅ **System information** (optional: run `uname -a` in terminal)

### Pro Tip: Make Your Screenshot Better
Open a terminal and run:
```bash
neofetch
```
This displays system info with the Kali logo - looks professional!

---

## Troubleshooting

### VM Won't Start - "VT-x is disabled"
**Solution:** Enable virtualization in BIOS
1. Restart computer
2. Enter BIOS (usually F2, F10, or Del key during boot)
3. Find "Virtualization Technology" or "Intel VT-x" or "AMD-V"
4. Enable it
5. Save and exit BIOS

### VM is Very Slow
**Solution:** Allocate more resources
1. Right-click VM in VirtualBox
2. Click Settings
3. System → increase RAM to 2048MB or more
4. Processor → increase CPUs to 2

### Can't Download Large Files
**Solution:** Use university network or download overnight

---

## Submission Checklist

- [ ] Written essay (10+ sentences) completed
- [ ] Kali Linux VM installed and running
- [ ] Screenshot taken showing Kali desktop
- [ ] Screenshot saved with clear filename
- [ ] Both components ready to upload

---

## Estimated Time Required
- **Download & Setup:** 30-60 minutes (depending on internet speed)
- **Written Response:** Already completed for you
- **Screenshot:** 2 minutes

**Total Time:** ~1 hour

aislice
=======


Overview
--------
aislice is a batch export plugin for iOS developer who uses Adobe Illustrator.
This plugin find all slices contained in the active document and exports them at multiple resolutions (non-Retina and Retina).


System Requirement
------------------
- Adobe Illustrator CC or later
  (might work on older version but I haven't tested it)


How to Use
----------
- Create a new document.
- Slice, slice, slice!
- Change the name of each slice.
  It'll be used as an expored path.

Then, there are two ways to use this plugin.

1. Running directly
  - Launch Adobe Illustrator CC.
  - File > Scripts > Other Script
  - Select `aislice.jsx`.

2. Registering as menu
  - Place `aislice.jsx` into the plugin directory
    (If you use OS X, `/Applications/Adobe Illustrator CC/Presets.localized/...`).
  - Launch Adobe Illustrator CC.
  - File > Scripts > Your Script


LICENSE
-------
Apache License, Version 2.0.
See LICENSE.txt for more information.

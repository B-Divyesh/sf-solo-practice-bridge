# Demo sandbox

Open <https://solo-practice-bridge.sociobot.in/demo/> or select **Try it with sample data** on the landing page.

The demo starts with a populated Autumn Leaves bridge. It has an observed shift problem, a three-minute drill, a four-minute return, one transfer note, and four revisit dates.

The banner stays visible while demo mode is active: **Demo — sample data, nothing is saved**. **Reset demo** restores that sample. **Start for real** deletes the demo database before opening the empty real workbook.

Demo records use the separate IndexedDB database `demo:solo-practice-bridge`. Real records use `solo-practice-bridge`. The app never reads or writes the real database while the demo banner is present. Demo license state uses `demo:` localStorage keys too.

The claim suite uses `/demo/` from a fresh browser context. It creates, exports, imports, resets, and reloads only this sandbox.

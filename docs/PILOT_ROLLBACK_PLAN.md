# Pilot Rollback Plan

During the internal staging pilot, if the `seosuite-connector` plugin causes conflicts with other WordPress plugins, dramatically slows down saving flows, or produces fatal PHP errors, follow this rollback plan.

## 1. Quick Deactivation (UI)
If the WordPress Admin dashboard is still accessible:
1. Navigate to **Plugins > Installed Plugins**.
2. Locate **SeoSuite Connector**.
3. Click **Deactivate**.
*This instantly stops all API calls and removes the score column and metabox from the UI.*

## 2. Emergency Deactivation (CLI/FTP)
If a fatal error prevents access to the WP Admin dashboard:
1. Access the server via SSH or FTP.
2. Navigate to `wp-content/plugins/`.
3. Rename the `seosuite-connector` folder to `seosuite-connector-disabled`.
   ```bash
   mv wp-content/plugins/seosuite-connector wp-content/plugins/seosuite-connector-disabled
   ```
4. WordPress will automatically detect the missing folder and gracefully deactivate the plugin, restoring site access.

## 3. Data Cleanup (Optional)
Deactivating the plugin leaves historical scores and settings in the database. If you wish to purge all SeoSuite data from the WordPress environment:
1. **Delete Settings:**
   ```sql
   DELETE FROM wp_options WHERE option_name LIKE 'seosuite_%';
   ```
2. **Delete Post Meta:**
   ```sql
   DELETE FROM wp_postmeta WHERE meta_key LIKE '_seosuite_%';
   ```

## 4. Reporting the Incident
If a rollback is required, please document:
- The exact WordPress error log (`wp-content/debug.log`).
- The plugins that were active at the time.
- The step that caused the failure (e.g., "Clicking Save Post" or "Opening the Editor").
- Submit this feedback for the next Phase planning.

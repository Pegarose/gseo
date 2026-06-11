<?php
/**
 * Plugin Name: SeoSuite Connector
 * Description: Minimal WordPress connector for SeoSuite scoring API.
 * Version: 0.1.1-beta
 * Author: SeoSuite Team
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class SeoSuite_Connector {
    private $option_name = 'seosuite_options';

    public function __construct() {
        // Admin menu
        add_action('admin_menu', [$this, 'add_plugin_page']);
        add_action('admin_init', [$this, 'page_init']);

        // Post Metabox
        add_action('add_meta_boxes', [$this, 'add_score_metabox']);

        // Custom Columns for Posts and Pages
        add_filter('manage_posts_columns', [$this, 'add_score_column']);
        add_filter('manage_pages_columns', [$this, 'add_score_column']);
        add_action('manage_posts_custom_column', [$this, 'render_score_column'], 10, 2);
        add_action('manage_pages_custom_column', [$this, 'render_score_column'], 10, 2);

        // Save Post hook (Auto-score)
        add_action('save_post', [$this, 'auto_score_on_save'], 10, 3);

        // AJAX handlers
        add_action('wp_ajax_seosuite_test_connection', [$this, 'ajax_test_connection']);
        add_action('wp_ajax_seosuite_score_post', [$this, 'ajax_score_post']);
    }

    /** --- Settings Page --- */

    public function add_plugin_page() {
        add_options_page(
            'SeoSuite Connector', 
            'SeoSuite', 
            'manage_options', 
            'seosuite-connector', 
            [$this, 'create_admin_page']
        );
    }

    public function create_admin_page() {
        ?>
        <div class="wrap">
            <h1>SeoSuite Connector Settings</h1>
            <form method="post" action="options.php">
            <?php
                settings_fields('seosuite_option_group');
                do_settings_sections('seosuite-connector');
                submit_button();
            ?>
            </form>

            <hr/>
            <h2>Test Connection</h2>
            <button class="button" id="seosuite-test-btn">Test Connection</button>
            <span id="seosuite-test-result"></span>

            <script>
            jQuery(document).ready(function($) {
                $('#seosuite-test-btn').on('click', function(e) {
                    e.preventDefault();
                    $('#seosuite-test-result').text('Testing...');
                    $.post(ajaxurl, {
                        action: 'seosuite_test_connection',
                        nonce: '<?php echo wp_create_nonce("seosuite_test_nonce"); ?>'
                    }, function(res) {
                        if(res.success) {
                            $('#seosuite-test-result').html('✅ <strong>Connection Successful!</strong> Target tenant: ' + res.data.tenant);
                        } else {
                            $('#seosuite-test-result').text('❌ ' + (res.data || 'Failed'));
                        }
                    });
                });
            });
            </script>
        </div>
        <?php
    }

    public function page_init() {
        register_setting('seosuite_option_group', $this->option_name, [$this, 'sanitize']);

        add_settings_section('seosuite_setting_section', 'API Settings', null, 'seosuite-connector');

        add_settings_field('api_url', 'API Base URL', [$this, 'api_url_callback'], 'seosuite-connector', 'seosuite_setting_section');
        add_settings_field('api_key', 'API Key', [$this, 'api_key_callback'], 'seosuite-connector', 'seosuite_setting_section');
        add_settings_field('site_id', 'Site ID', [$this, 'site_id_callback'], 'seosuite-connector', 'seosuite_setting_section');
        add_settings_field('auto_score', 'Auto-Score on Save', [$this, 'auto_score_callback'], 'seosuite-connector', 'seosuite_setting_section');
    }

    public function sanitize($input) {
        $sanitized = [];
        if (isset($input['api_key'])) {
            $existing = get_option($this->option_name);
            if(empty($input['api_key']) && !empty($existing['api_key'])) {
                $sanitized['api_key'] = $existing['api_key'];
            } else {
                $sanitized['api_key'] = sanitize_text_field($input['api_key']);
            }
        }
        if (isset($input['api_url'])) $sanitized['api_url'] = esc_url_raw($input['api_url']);
        if (isset($input['site_id'])) $sanitized['site_id'] = sanitize_text_field($input['site_id']);
        if (isset($input['auto_score'])) $sanitized['auto_score'] = 1;
        return $sanitized;
    }

    public function api_key_callback() {
        $options = get_option($this->option_name);
        $key = isset($options['api_key']) ? $options['api_key'] : '';
        $display = $key ? substr($key, 0, 10) . '••••••••••••' : '';
        printf(
            '<input type="text" id="api_key" name="seosuite_options[api_key]" value="" placeholder="%s" class="regular-text" />',
            esc_attr($display ? $display : 'Enter API Key')
        );
        echo '<p class="description">Leave blank to keep existing key.</p>';
    }

    public function api_url_callback() {
        $options = get_option($this->option_name);
        $url = isset($options['api_url']) ? $options['api_url'] : 'https://api.seosuite.app/v1';
        printf('<input type="url" id="api_url" name="seosuite_options[api_url]" value="%s" class="regular-text" />', esc_attr($url));
    }

    public function site_id_callback() {
        $options = get_option($this->option_name);
        $site_id = isset($options['site_id']) ? $options['site_id'] : '';
        printf('<input type="text" id="site_id" name="seosuite_options[site_id]" value="%s" class="regular-text" />', esc_attr($site_id));
        echo '<p class="description">The Site ID provided by SeoSuite for this WordPress installation.</p>';
    }

    public function auto_score_callback() {
        $options = get_option($this->option_name);
        $checked = isset($options['auto_score']) && $options['auto_score'] == 1 ? 'checked' : '';
        echo "<input type='checkbox' name='seosuite_options[auto_score]' value='1' $checked /> Score content automatically when saving a post.";
    }

    /** --- API Handlers --- */

    private function do_api_request($endpoint, $body = null) {
        $options = get_option($this->option_name);
        if (empty($options['api_key'])) return new WP_Error('no_key', 'API key not configured.');

        $url = rtrim($options['api_url'] ?? 'https://api.seosuite.app/v1', '/') . $endpoint;
        $args = [
            'headers' => [
                'Authorization' => 'Bearer ' . $options['api_key'],
                'Content-Type' => 'application/json'
            ],
            'timeout' => 8
        ];

        if ($body !== null) {
            $args['method'] = 'POST';
            $args['body'] = wp_json_encode($body);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }

    public function ajax_test_connection() {
        check_ajax_referer('seosuite_test_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_send_json_error('Unauthorized');

        $res = $this->do_api_request('/auth/me');
        if (is_wp_error($res)) {
            wp_send_json_error($res->get_error_message());
        } elseif (isset($res['success']) && $res['success']) {
            wp_send_json_success(['tenant' => sanitize_text_field($res['data']['tenantId'])]);
        } else {
            wp_send_json_error(sanitize_text_field($res['error']['message'] ?? 'Invalid response'));
        }
    }

    public function auto_score_on_save($post_id, $post, $update) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if ($post->post_status !== 'publish') return;

        $options = get_option($this->option_name);
        if (empty($options['auto_score'])) return;

        // API failures here MUST NOT block WordPress saving flow. WP_Error is ignored intentionally.
        $this->execute_score_post($post_id);
    }

    public function ajax_score_post() {
        check_ajax_referer('seosuite_score_nonce', 'nonce');
        if (!current_user_can('edit_posts')) wp_send_json_error('Unauthorized');

        $post_id = intval($_POST['post_id']);
        $result = $this->execute_score_post($post_id);

        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success($result);
        }
    }

    private function execute_score_post($post_id) {
        $post = get_post($post_id);
        if (!$post) return new WP_Error('no_post', 'Post not found.');
        
        $options = get_option($this->option_name);
        $site_id = $options['site_id'] ?? '';

        $permalink = get_permalink($post_id);
        $title = get_the_title($post_id);

        // Render HTML for API (approximate for Phase 2/3)
        $html = "<html><head><title>{$title}</title></head><body><h1>{$title}</h1>" . apply_filters('the_content', $post->post_content) . "</body></html>";

        $res = $this->do_api_request('/score/content', [
            'siteId' => $site_id,
            'url' => $permalink,
            'html' => $html,
            'options' => ['storeSnapshot' => true, 'includeNeuronWriter' => true]
        ]);

        if (is_wp_error($res)) {
            // Include message for WP_Error (e.g. timeout)
            return new WP_Error('api_error', 'Analysis Unavailable: ' . $res->get_error_message());
        }

        if (isset($res['success']) && $res['success']) {
            $data = $res['data'];
            $score = intval($data['finalScore']);
            $scoreBand = sanitize_text_field($data['scoreBand']);
            $snapshot_id = sanitize_text_field($data['snapshotId']);
            
            // Extract top issues & recommendations
            $top_issues = array_slice($data['topIssues'] ?? [], 0, 5);
            $top_recommendations = array_slice($data['quickWins'] ?? [], 0, 5);

            update_post_meta($post_id, '_seosuite_latest_score', $score);
            update_post_meta($post_id, '_seosuite_score_band', $scoreBand);
            update_post_meta($post_id, '_seosuite_snapshot_id', $snapshot_id);
            update_post_meta($post_id, '_seosuite_last_scrored_at', time());
            update_post_meta($post_id, '_seosuite_top_issues', wp_json_encode($top_issues));
            update_post_meta($post_id, '_seosuite_top_recommendations', wp_json_encode($top_recommendations));

            return ['score' => $score, 'snapshotId' => $snapshot_id];
        }

        // Handle 429 or other API error responses
        $error_msg = $res['error']['message'] ?? 'Unknown API Error';
        if (isset($res['error']['code']) && $res['error']['code'] === 'RATE_LIMIT_EXCEEDED') {
            $error_msg = "Take a breath! You've scored too many pages recently. Please wait a moment.";
        }

        return new WP_Error('api_error', $error_msg);
    }

    /** --- Admin List Column --- */

    public function add_score_column($columns) {
        $columns['seosuite_score'] = 'SeoSuite';
        return $columns;
    }

    public function render_score_column($column, $post_id) {
        if ($column === 'seosuite_score') {
            $score = get_post_meta($post_id, '_seosuite_latest_score', true);
            $band = get_post_meta($post_id, '_seosuite_score_band', true);
            $last_scored = get_post_meta($post_id, '_seosuite_last_scrored_at', true);
            
            if ($score !== '') {
                $color = '#666';
                if ($band === 'excellent') $color = '#10b981'; // Green
                elseif ($band === 'good') $color = '#84cc16'; // Light green
                elseif ($band === 'needs_improvement') $color = '#f59e0b'; // Yellow
                elseif ($band === 'poor') $color = '#f97316'; // Orange
                elseif ($band === 'critical') $color = '#ef4444'; // Red
                
                $date_str = $last_scored ? date('M j, Y', $last_scored) : 'Unknown';
                
                echo "<div style='display:inline-block; padding:3px 8px; border-radius:12px; background-color:{$color}; color:white; font-weight:bold; font-size:12px;'>Score: {$score}</div>";
                echo "<div style='font-size:10px; color:#888; margin-top:4px;'>{$date_str}</div>";
            } else {
                echo "<span style='color:#999; font-size:12px;'>Not scored</span>";
            }
        }
    }

    /** --- Metabox --- */

    public function add_score_metabox() {
        add_meta_box('seosuite_score_box', 'SeoSuite Analysis', [$this, 'render_score_metabox'], ['post', 'page'], 'side', 'high');
    }

    public function render_score_metabox($post) {
        $score = get_post_meta($post->ID, '_seosuite_latest_score', true);
        $band = get_post_meta($post->ID, '_seosuite_score_band', true);
        $last_scored = get_post_meta($post->ID, '_seosuite_last_scrored_at', true);
        $issues_json = get_post_meta($post->ID, '_seosuite_top_issues', true);
        $recs_json = get_post_meta($post->ID, '_seosuite_top_recommendations', true);

        $issues = $issues_json ? json_decode($issues_json, true) : [];
        $recs = $recs_json ? json_decode($recs_json, true) : [];

        ?>
        <div style="padding-bottom: 10px;">
            <?php if ($score !== ''): ?>
                <?php 
                    $color = '#666';
                    if ($band === 'excellent') $color = '#10b981';
                    elseif ($band === 'good') $color = '#84cc16';
                    elseif ($band === 'needs_improvement') $color = '#f59e0b';
                    elseif ($band === 'poor') $color = '#f97316';
                    elseif ($band === 'critical') $color = '#ef4444';
                ?>
                <p><strong>Score:</strong> 
                   <span style="display:inline-block; padding:3px 8px; border-radius:12px; background-color:<?php echo $color; ?>; color:white; font-weight:bold; font-size:14px;">
                     <?php echo esc_html($score); ?>/100
                   </span>
                </p>
                <p><small>Band: <?php echo esc_html(ucwords(str_replace('_', ' ', $band))); ?></small></p>
                <p><small>Scored on: <?php echo date('Y-m-d H:i:s', $last_scored); ?></small></p>
                
                <?php if (!empty($issues)): ?>
                    <hr/>
                    <p><strong>Top Issues:</strong></p>
                    <ul style="margin-left: 14px; list-style-type: disc;">
                        <?php foreach($issues as $issue): ?>
                            <li style="margin-bottom: 4px; font-size: 12px;"><?php echo esc_html($issue['title']); ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>

                <?php if (!empty($recs)): ?>
                    <hr/>
                    <p><strong>Quick Wins:</strong></p>
                    <ul style="margin-left: 14px; list-style-type: disc;">
                        <?php foreach($recs as $rec): ?>
                            <li style="margin-bottom: 4px; font-size: 12px;"><?php echo esc_html($rec['title']); ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>

            <?php else: ?>
                <p>No score available yet.</p>
            <?php endif; ?>
        </div>
        <hr/>
        <button type="button" class="button button-primary" id="seosuite-score-now" style="width: 100%;">Score Now</button>
        <div id="seosuite-score-status" style="margin-top:10px; font-size:13px; text-align:center;"></div>

        <script>
        jQuery(document).ready(function($) {
            $('#seosuite-score-now').on('click', function(e) {
                e.preventDefault();
                var btn = $(this);
                btn.prop('disabled', true);
                $('#seosuite-score-status').html('<span style="color:#0073aa;">Analyzing... Please wait.</span>');
                
                $.post(ajaxurl, {
                    action: 'seosuite_score_post',
                    post_id: <?php echo intval($post->ID); ?>,
                    nonce: '<?php echo wp_create_nonce("seosuite_score_nonce"); ?>'
                }, function(res) {
                    if(res.success) {
                        $('#seosuite-score-status').html('<span style="color:#10b981;">✅ Analysis Complete! Reloading...</span>');
                        setTimeout(() => location.reload(), 1000);
                    } else {
                        $('#seosuite-score-status').html('<span style="color:#ef4444;">❌ Error: ' + res.data + '</span>');
                        btn.prop('disabled', false);
                    }
                }).fail(function() {
                    $('#seosuite-score-status').html('<span style="color:#ef4444;">❌ Connection Error</span>');
                    btn.prop('disabled', false);
                });
            });
        });
        </script>
        <?php
    }
}

new SeoSuite_Connector();

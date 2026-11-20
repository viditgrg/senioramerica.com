<?php

/**
 * @file
 * Post update functions for senior_america.
 */

/**
 * Implements hook_removed_post_updates().
 */
function senior_america_removed_post_updates(): array {
  return [
    'senior_america_post_update_add_senior_america_primary_color' => '11.0.0',
  ];
}

/**
 * Remove shortcut settings if shortcut module is not installed.
 */
function senior_america_post_update_remove_shortcut_settings_if_not_installed(): void {
  $settings = \Drupal::configFactory()->getEditable('senior_america.settings');

  $settings->clear('third_party_settings.shortcut')
    ->save();

  if (empty($settings->get('third_party_settings'))) {
    $settings->clear('third_party_settings')
      ->save();
  }
}

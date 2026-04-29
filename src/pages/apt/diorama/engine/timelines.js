/**
 * timelines.js — 14 ATT&CK 단계별 비주얼 이벤트 타임라인
 * 공격 실행 코드 0%. 각 이벤트는 "장면 변화"의 트리거.
 */
export const TIMELINES = {
  reconnaissance: [
    { at: 0.0, event: "ambient_start",       target: "desk" },
    { at: 0.6, event: "spawn_cards",         target: "profile_cards" },
    { at: 1.2, event: "scanner_sweep",       target: "profiles" },
    { at: 2.0, event: "glow_hotspot",        target: "crypto_bot" },
    { at: 3.0, event: "connect_clues",       target: "relationship_lines" },
    { at: 4.0, event: "lock_target",         target: "target_developer" },
    { at: 4.6, event: "activate_attack_line", target: "stage_node_01" },
  ],
  initial_access: [
    { at: 0.0, event: "room_idle",           target: "developer_room" },
    { at: 0.8, event: "email_arrives",       target: "email_voxel" },
    { at: 1.4, event: "attachment_pulse",    target: "pkg_voxel" },
    { at: 2.2, event: "trust_meter_shift",   target: "trust_meter" },
    { at: 3.2, event: "door_crack",          target: "server_room_gate" },
    { at: 4.0, event: "thin_red_thread",     target: "attack_path" },
  ],
  execution: [
    { at: 0.0, event: "app_launch",          target: "trading_app" },
    { at: 0.8, event: "normal_ui_glow",      target: "chart_screen" },
    { at: 1.5, event: "ghost_packets",       target: "background_thread" },
    { at: 2.5, event: "memory_blocks_light", target: "memory_grid" },
    { at: 3.5, event: "shadow_moves",        target: "hidden_payload_metaphor" },
  ],
  persistence: [
    { at: 0.0, event: "system_reboot",       target: "boot_rail" },
    { at: 1.0, event: "startup_slot_highlight", target: "startup_slot" },
    { at: 2.0, event: "backdoor_wakes",      target: "sleeping_cube" },
    { at: 3.0, event: "auto_run_loop",       target: "boot_cycle" },
  ],
  privilege_escalation: [
    { at: 0.0, event: "locked_elevator",     target: "privilege_tower" },
    { at: 1.0, event: "prompt_appears",      target: "trust_prompt" },
    { at: 2.0, event: "token_rises",         target: "permission_token" },
    { at: 3.0, event: "admin_ring_glow",     target: "admin_ring" },
  ],
  defense_evasion: [
    { at: 0.0, event: "edr_spotlight",       target: "room" },
    { at: 1.0, event: "object_hides",        target: "trusted_silhouette" },
    { at: 2.0, event: "confidence_drops",    target: "detection_meter" },
  ],
  credential_access: [
    { at: 0.0, event: "vault_idle",          target: "credential_vault" },
    { at: 1.0, event: "weak_secret_glow",    target: "secret_fragments" },
    { at: 2.0, event: "fragments_flow",      target: "attacker_path" },
  ],
  discovery: [
    { at: 0.0, event: "network_fog",         target: "network_floor" },
    { at: 1.0, event: "scanner_pulse",       target: "subnet" },
    { at: 2.0, event: "nodes_materialize",   target: "hosts" },
    { at: 3.0, event: "wallet_candidate_glow", target: "wallet_node" },
  ],
  lateral_movement: [
    { at: 0.0, event: "segment_gates",       target: "network_zones" },
    { at: 1.0, event: "trust_path_reveal",   target: "allowed_path" },
    { at: 2.0, event: "snake_motion",        target: "movement_line" },
  ],
  collection: [
    { at: 0.0, event: "vault_open",          target: "wallet_server" },
    { at: 1.0, event: "sensitive_asset_highlight", target: "key_objects" },
    { at: 2.0, event: "bundle_forms",        target: "collection_bundle" },
  ],
  command_and_control: [
    { at: 0.0, event: "traffic_streams",     target: "egress_lines" },
    { at: 1.0, event: "beacon_rhythm",       target: "suspicious_thread" },
    { at: 2.0, event: "red_thread_visible",  target: "c2_line" },
  ],
  exfiltration: [
    { at: 0.0, event: "data_fragments",      target: "data_blocks" },
    { at: 1.0, event: "dlp_sensor_pulse",    target: "dlp_sensor" },
    { at: 2.0, event: "egress_visualized",   target: "exit_path" },
  ],
  impact: [
    { at: 0.0, event: "stability_drop",      target: "system_meter" },
    { at: 1.0, event: "blast_radius",        target: "server_room" },
    { at: 2.0, event: "containment_nodes",   target: "backup_nodes" },
    { at: 3.0, event: "ir_timeline",         target: "response_panel" },
  ],
  wrap_up: [
    { at: 0.0, event: "stage_grid_in",       target: "stage_grid" },
    { at: 1.0, event: "chain_glow",          target: "stage_chain" },
    { at: 2.0, event: "path_replay",         target: "learner_path" },
  ],
};

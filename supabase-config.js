// Supabase Configuration for TradeTax
const SUPABASE_URL = 'https://issryxbhnwezxwrjhznq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ng-4FojiB1es07oJ0w1_Xg_7pXRe6C_';

// Initialize Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient && typeof window !== 'undefined') {
    supabaseClient = window.supabaseClient || window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

function initSupabase() {
  if (typeof window !== 'undefined' && !window.supabase) {
    window.supabase = window.supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return window.supabase;
}

// For use in modules
module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  getSupabaseClient,
  initSupabase
};

/* ============================================================
   EduSlate — Shared Curriculum Data + Progress Storage Helpers
   Include this file BEFORE your page-specific script in both
   map.html and classroom.html:
     <script src="curriculum.js"></script>
   ============================================================ */

// ---------------------------------------------------------
// CURRICULUM DATA
// videoId       -> the 11-character ID from a youtube.com/watch?v=XXXXXXXXXXX URL
// checkpointSec -> the second at which the video auto-pauses for the quiz
// ---------------------------------------------------------
const CURRICULUM = {
  lkg: {
    label: "LKG",
    chapters: [
      { id: 1, title: "Counting 1–10",        videoId: "tRys9ajsSwM", checkpointSec: 60 },
      { id: 2, title: "Number Recognition 1–20", videoId: "FvcS4BF4cKk", checkpointSec: 60 },
      { id: 3, title: "More / Less / Equal",     videoId: "HO8UvN2DV4A", checkpointSec: 60 },
      { id: 4, title: "One More, One Less",      videoId: "NZVtJIdLFuU", checkpointSec: 60 },
      { id: 5, title: "Addition Within 5",       videoId: "s7cstF8Mz74", checkpointSec: 45 },
    ]
  },
  ukg: {
    label: "UKG",
    chapters: [
      { id: 1, title: "Counting & Numbers 1–100", videoId: "xZSTL39XmdA", checkpointSec: 60 },
      { id: 2, title: "Addition Within 10",          videoId: "syr5GL2h0hY", checkpointSec: 60 },
      { id: 3, title: "Addition Within 20",          videoId: "AaxrqDuw1Xk", checkpointSec: 60 },
      { id: 4, title: "Simple Word Problems",        videoId: "q7mi24ClSMw", checkpointSec: 60 },
      { id: 5, title: "Number Bonds & Patterns",     videoId: "lD9tjBUiXs0", checkpointSec: 60 },
    ]
  }
};

// ---------------------------------------------------------
// PROFILES MANAGER
// ---------------------------------------------------------
function getProfiles(){
  try{
    const raw = localStorage.getItem("eduslate_profiles");
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.warn("Could not read profiles.", e);
    return [];
  }
}

function saveProfiles(profiles){
  try{
    localStorage.setItem("eduslate_profiles", JSON.stringify(profiles));
  }catch(e){
    console.warn("Could not save profiles.", e);
  }
}

function createProfile(name, avatar){
  const profiles = getProfiles();
  const profile = { id: "p_" + Date.now(), name, avatar };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

function deleteProfile(id){
  const profiles = getProfiles().filter(p => p.id !== id);
  saveProfiles(profiles);
}

function getActiveProfileId(){
  return localStorage.getItem("eduslate_active_profile");
}

function setActiveProfileId(id){
  localStorage.setItem("eduslate_active_profile", id);
}

function getActiveProfile(){
  const id = getActiveProfileId();
  if(!id) return null;
  return getProfiles().find(p => p.id === id) || null;
}

// 🔥 UPDATED: Enforces root redirect to index.html instead of login.html
function requireProfile(){
  const profile = getActiveProfile();
  if(!profile){
    window.location.href = "index.html"; 
    return null;
  }
  return profile;
}

// ---------------------------------------------------------
// PROGRESS STORAGE 
// ---------------------------------------------------------
function progressKey(grade){
  const profileId = getActiveProfileId() || "guest";
  return `eduslate_progress_${profileId}_${grade}`;
}

function loadProgress(grade){
  try{
    const raw = localStorage.getItem(progressKey(grade));
    if(!raw) return { completed: [], unlocked: [1] };
    const parsed = JSON.parse(raw);
    if(!parsed.unlocked || !parsed.unlocked.includes(1)){
      parsed.unlocked = [1, ...(parsed.unlocked || [])];
    }
    if(!parsed.completed) parsed.completed = [];
    return parsed;
  }catch(e){
    console.warn("Progress read failed, resetting.", e);
    return { completed: [], unlocked: [1] };
  }
}

function saveProgress(grade, progress){
  try{
    localStorage.setItem(progressKey(grade), JSON.stringify(progress));
  }catch(e){
    console.warn("Progress save failed.", e);
  }
}

function completeChapter(grade, id){
  const chapters = CURRICULUM[grade].chapters;
  const progress = loadProgress(grade);
  if(!progress.completed.includes(id)) progress.completed.push(id);
  const next = id + 1;
  if(chapters.some(c => c.id === next) && !progress.unlocked.includes(next)){
    progress.unlocked.push(next);
  }
  saveProgress(grade, progress);
  return progress;
}

// ---------------------------------------------------------
// LAST-SELECTED GRADE STATE HELPERS
// ---------------------------------------------------------
function getCurrentGrade(){
  return localStorage.getItem("eduslate_current_grade") || "lkg";
}
function setCurrentGrade(grade){
  localStorage.setItem("eduslate_current_grade", grade);
}

function getParam(name, fallback){
  const val = new URLSearchParams(window.location.search).get(name);
  return val !== null ? val : fallback;
}

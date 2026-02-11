#!/usr/bin/env python3
"""
Voice Authentication using Resemblyzer
Handles enrollment and verification of voice samples
"""

import sys
import json
import os
import io
import numpy as np
from pathlib import Path

# Suppress Resemblyzer's "Loaded the voice encoder model..." print
_real_stdout = sys.stdout
sys.stdout = io.StringIO()
from resemblyzer import VoiceEncoder, preprocess_wav
encoder = VoiceEncoder()
sys.stdout = _real_stdout

# Directory to store voice profiles
PROFILES_DIR = Path("voice_profiles")
PROFILES_DIR.mkdir(exist_ok=True)

def enroll_voice(user_id, audio_files):
    """
    Enroll a user by creating a voice profile from multiple audio samples

    Args:
        user_id: Unique identifier for the user
        audio_files: List of paths to audio files for enrollment

    Returns:
        dict: Success status and message
    """
    try:
        embeddings = []

        for audio_file in audio_files:
            if not os.path.exists(audio_file):
                return {"success": False, "error": f"Audio file not found: {audio_file}"}

            # Preprocess and encode the audio
            wav = preprocess_wav(audio_file)
            embedding = encoder.embed_utterance(wav)
            embeddings.append(embedding)

        # Average the embeddings to create a robust voice profile
        voice_profile = np.mean(embeddings, axis=0)

        # Save the voice profile
        profile_path = PROFILES_DIR / f"{user_id}.npy"
        np.save(profile_path, voice_profile)

        return {
            "success": True,
            "message": f"Voice profile created for user {user_id}",
            "samples_used": len(embeddings)
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

def verify_voice(user_id, audio_file, threshold=0.75):
    """
    Verify if the voice in the audio file matches the enrolled user

    Args:
        user_id: Unique identifier for the user
        audio_file: Path to the audio file to verify
        threshold: Similarity threshold (0-1, default 0.75)

    Returns:
        dict: Verification result with similarity score
    """
    try:
        profile_path = PROFILES_DIR / f"{user_id}.npy"

        if not profile_path.exists():
            return {"success": False, "error": f"No voice profile found for user {user_id}"}

        if not os.path.exists(audio_file):
            return {"success": False, "error": f"Audio file not found: {audio_file}"}

        # Load the stored voice profile
        stored_profile = np.load(profile_path)

        # Process the new audio sample
        wav = preprocess_wav(audio_file)
        new_embedding = encoder.embed_utterance(wav)

        # Calculate cosine similarity
        similarity = np.dot(stored_profile, new_embedding) / (
            np.linalg.norm(stored_profile) * np.linalg.norm(new_embedding)
        )

        # Determine if verification passed
        similarity = float(similarity)
        verified = bool(similarity >= threshold)

        return {
            "success": True,
            "verified": verified,
            "similarity": similarity,
            "threshold": float(threshold),
            "message": "Voice verified" if verified else "Voice verification failed"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

def list_enrolled_users():
    """List all enrolled users"""
    try:
        users = [f.stem for f in PROFILES_DIR.glob("*.npy")]
        return {"success": True, "users": users, "count": len(users)}
    except Exception as e:
        return {"success": False, "error": str(e)}

def delete_profile(user_id):
    """Delete a user's voice profile"""
    try:
        profile_path = PROFILES_DIR / f"{user_id}.npy"
        if profile_path.exists():
            profile_path.unlink()
            return {"success": True, "message": f"Profile deleted for {user_id}"}
        return {"success": False, "error": f"No profile found for {user_id}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command provided"}))
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "enroll":
            # python voiceAuth.py enroll <user_id> <audio_file1> <audio_file2> ...
            user_id = sys.argv[2]
            audio_files = sys.argv[3:]
            result = enroll_voice(user_id, audio_files)

        elif command == "verify":
            # python voiceAuth.py verify <user_id> <audio_file> [threshold]
            user_id = sys.argv[2]
            audio_file = sys.argv[3]
            threshold = float(sys.argv[4]) if len(sys.argv) > 4 else 0.75
            result = verify_voice(user_id, audio_file, threshold)

        elif command == "list":
            # python voiceAuth.py list
            result = list_enrolled_users()

        elif command == "delete":
            # python voiceAuth.py delete <user_id>
            user_id = sys.argv[2]
            result = delete_profile(user_id)

        else:
            result = {"success": False, "error": f"Unknown command: {command}"}

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

#!/usr/bin/env python3
import os, sys, subprocess, yaml, glob

def run_yaml(path):
    spec = yaml.safe_load(open(path))
    steps = spec.get("steps") or spec.get("run") or []
    if not isinstance(steps, list):
        return
    for s in steps:
        if isinstance(s, dict):
            name = s.get("name") or s.get("id") or "step"
            cmd = s.get("run")
            if not cmd: continue
            print(f"\n=== {path} :: {name} ===")
            rc = subprocess.call(cmd, shell=True)
            if rc!=0:
                print(f"Step failed: {name} rc={rc}")
                sys.exit(rc)

def main():
    if len(sys.argv)<2:
        print("Usage: run_tests.py tests/**/*.yaml")
        sys.exit(1)
    for arg in sys.argv[1:]:
        for p in glob.glob(arg, recursive=True):
            run_yaml(p)

if __name__=="__main__":
    main()

import sys
import json
import os

def parse_benchmark(log_path):
    """
    Parses a simple benchmark output file (JSON or plain text) to extract throughput and latency.
    Supports autocannon/wrk JSON output formats if structured, or simple log format:
    throughput: X req/sec
    p95: Y ms
    """
    if not os.path.exists(log_path):
        print(f"Benchmark log not found: {log_path}", file=sys.stderr)
        return None
    
    try:
        with open(log_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Try JSON parsing
        try:
            data = json.loads(content)
            # Autocannon style
            if 'requests' in data and 'average' in data['requests']:
                throughput = data['requests']['average']
                p95 = data.get('latency', {}).get('p95', 0)
                return {"throughput": throughput, "latency_p95": p95}
        except json.JSONDecodeError:
            pass
        
        # Plain text regex/line parsing
        throughput = 0.0
        p95 = 0.0
        for line in content.splitlines():
            line_lower = line.lower()
            if "throughput:" in line_lower or "requests/sec:" in line_lower:
                parts = line.split(":")
                if len(parts) > 1:
                    try:
                        throughput = float(parts[1].replace("req/sec", "").replace("reqs/sec", "").strip())
                    except ValueError:
                        pass
            elif "p95:" in line_lower or "95%:" in line_lower:
                parts = line.split(":")
                if len(parts) > 1:
                    try:
                        p95 = float(parts[1].replace("ms", "").strip())
                    except ValueError:
                        pass
        return {"throughput": throughput, "latency_p95": p95}
    except Exception as e:
        print(f"Error parsing benchmark: {e}", file=sys.stderr)
        return None

def score_performance(throughput, latency_p95):
    """
    Normalizes benchmark metrics into a 1-5 score.
    Simple heuristic thresholds:
    Throughput: >=5000=5, >=2000=4, >=1000=3, >=200=2, else 1
    Latency p95: <=10ms=5, <=50ms=4, <=200ms=3, <=1000ms=2, else 1
    """
    t_score = 1
    if throughput >= 5000: t_score = 5
    elif throughput >= 2000: t_score = 4
    elif throughput >= 1000: t_score = 3
    elif throughput >= 200: t_score = 2
    
    l_score = 1
    if latency_p95 <= 10: l_score = 5
    elif latency_p95 <= 50: l_score = 4
    elif latency_p95 <= 200: l_score = 3
    elif latency_p95 <= 1000: l_score = 2
    
    # Average of throughput and latency score
    return round((t_score + l_score) / 2.0)

def main():
    if len(sys.argv) < 2:
        print("Usage: python evaluate_matrix.py <matrix_config.json> [output_adr.md]", file=sys.stderr)
        sys.exit(1)
        
    config_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(config_path):
        print(f"Config file not found: {config_path}", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
    except Exception as e:
        print(f"Failed to read JSON config: {e}", file=sys.stderr)
        sys.exit(1)
        
    dimensions = config.get("dimensions", {})
    candidates = config.get("candidates", [])
    
    # Process benchmark logs for performance scoring if specified
    for candidate in candidates:
        benchmark_log = candidate.get("benchmark_log")
        if benchmark_log:
            metrics = parse_benchmark(benchmark_log)
            if metrics:
                perf_score = score_performance(metrics["throughput"], metrics["latency_p95"])
                print(f"Auto-scored Performance for {candidate['name']}: {perf_score}/5 based on benchmark ({metrics['throughput']} rps, {metrics['latency_p95']}ms p95)")
                if "scores" not in candidate:
                    candidate["scores"] = {}
                candidate["scores"]["Performance"] = perf_score
                
    # Calculate weighted scores
    results = []
    max_score = sum(dimensions.values()) * 5
    
    for candidate in candidates:
        name = candidate["name"]
        scores = candidate.get("scores", {})
        total_weighted = 0
        
        # Details list for debugging/transparency
        details = []
        for dim, weight in dimensions.items():
            score = scores.get(dim, 3) # default middle score if not specified
            weighted = score * weight
            total_weighted += weighted
            details.append(f"{dim}: {score} (weighted: {weighted})")
            
        results.append({
            "name": name,
            "weighted_score": total_weighted,
            "max_score": max_score,
            "percentage": (total_weighted / max_score) * 100,
            "pros": candidate.get("pros", []),
            "cons": candidate.get("cons", []),
            "details": details
        })
        
    # Sort candidates by score descending
    results.sort(key=lambda x: x["weighted_score"], reverse=True)
    
    # Generate Markdown output
    markdown = "## 候选方案对比\n\n"
    markdown += "| 候选 | 总分 | 百分比 | 优势 | 劣势 |\n"
    markdown += "| :--- | :---: | :---: | :--- | :--- |\n"
    
    for res in results:
        pros_str = "<br>".join([f"• {p}" for p in res["pros"]])
        cons_str = "<br>".join([f"• {c}" for c in res["cons"]])
        markdown += f"| {res['name']} | **{res['weighted_score']}** / {res['max_score']} | {res['percentage']:.1f}% | {pros_str} | {cons_str} |\n"
        
    markdown += "\n\n### 评分明细\n\n"
    for res in results:
        markdown += f"#### {res['name']} ({res['weighted_score']} / {res['max_score']})\n"
        markdown += ", ".join(res["details"]) + "\n\n"
        
    if output_path:
        # If output_path is provided, we can append/overwrite the ADR
        if os.path.exists(output_path):
            try:
                with open(output_path, 'r', encoding='utf-8') as f:
                    adr_content = f.read()
                
                # Replace the placeholder or segment
                marker_start = "## 候选方案对比"
                marker_end = "## 决策"
                
                if marker_start in adr_content and marker_end in adr_content:
                    before = adr_content.split(marker_start)[0]
                    after = adr_content.split(marker_end)[1]
                    new_adr = before + markdown + "\n" + marker_end + after
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(new_adr)
                    print(f"Successfully updated ADR file: {output_path}")
                else:
                    # Just append it
                    with open(output_path, 'a', encoding='utf-8') as f:
                        f.write("\n\n" + markdown)
                    print(f"Appended results to: {output_path}")
            except Exception as e:
                print(f"Failed to write to output file: {e}", file=sys.stderr)
        else:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown)
            print(f"Saved markdown matrix to new file: {output_path}")
    else:
        print("\n--- Generated Markdown Matrix ---")
        print(markdown)

if __name__ == "__main__":
    main()

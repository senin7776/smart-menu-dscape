import psycopg2

def test_conn(password):
    for host, port in [
        ("db.jmqljyniphlzmpwytujs.supabase.co", 5432),
        ("aws-0-ap-south-1.pooler.supabase.com", 65432),
        ("aws-0-ap-south-1.pooler.supabase.com", 5432),
    ]:
        try:
            print(f"Testing {host}:{port} with user postgres...")
            conn = psycopg2.connect(
                dbname="postgres",
                user=f"postgres.jmqljyniphlzmpwytujs" if "pooler" in host else "postgres",
                password=password,
                host=host,
                port=port,
                connect_timeout=5,
                sslmode="require"
            )
            print(f"SUCCESS on {host}:{port}!")
            return conn
        except Exception as e:
            print(f"Failed {host}:{port}: {e}")
    return None

conn = test_conn("Senin@968650776")
if not conn:
    # Try with brackets just in case
    test_conn("[Senin@968650776]")


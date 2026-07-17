# Python laboratory

The module is deliberately educational and is not production trading or risk infrastructure.

```bash
python finance_models.py --generate-data --output-dir ../data --figure-dir ../figures
python -m unittest discover -s . -p 'test_*.py' -v
```

The generated prices and returns are simulated with a fixed seed and must not be presented as historical market performance.

# DotStruct Plot

## Compile Project

``` bash
bower install
npm install 
```

For debugging run `gulp serve`, to get a distribution javascript file run `gulp build`.

## Generate Data Files
``` bash
python scripts/dotplus.py GGAACGCCGCGGUCAGCUCGGCUGCUGCGAAGAGUCUCUGUUGUUCC > data/4o26.json
```
```bash
python scripts/dotplus.py UGAAACGGAGGAGACGUUACAGCAACGUGUCAGCUGAAAUGAUGGGCGUAGACGCACGUCAGCGGCGGAAAUGGUUUCUAUCAAAAUGAAAGUGUUUAGAGAUUUUCCUCAAGUUUCA > data/4o26.json
```
```bash
python scripts/dotplus.py AGGUCUCGGAUGUUAUUUCUACCAGGUGAAUGAUCUAUUGACGCUCGCCAAACAUGGGCGACCCGAGACCU > data/tristable.json
```
```bash
python scripts/dotplus.py UACACUGCCCAGGUAGUGCUUACACUACAACUGUAGUGGG  > data/bistable.json
```

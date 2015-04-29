#!/usr/bin/python

import collections as col
import forgi.utilities.stuff as fus
import itertools as it
import json
import math
import RNA
import sys
from optparse import OptionParser

def main():
    usage = """
    python scripts/dotplus.py sequence

    Create a file for displaying as a dotplot using the provided sequence.

    If the provided sequence is '-', then read the sequence from stdin.
    """
    num_args= 1
    parser = OptionParser(usage=usage)

    #parser.add_option('-o', '--options', dest='some_option', default='yo', help="Place holder for a real option", type='str')
    #parser.add_option('-u', '--useless', dest='uselesss', default=False, action='store_true', help='Another useless option')

    (options, args) = parser.parse_args()

    if len(args) < num_args:
        parser.print_help()
        sys.exit(1)

    if args[0] == '-':
        seq = sys.stdin.read()
    else:
        seq = args[0].strip()

    # pf_fold returns the MFE as well as the partition function energy
    mfe, pfe = RNA.pf_fold(seq)
    prob_matrix = RNA.export_bppm()

    bp_to_seq = {}

    # get all of the suboptimal structures
    subopts = RNA.zukersubopt(seq)
    for i in range(0, subopts.size()):
        s = subopts.get(i)
        pt = fus.dotbracket_to_pairtable(s.structure)

        # go through each base pair and store the sequence
        # it came from so that it can be output later
        for j in range(1, pt[0]+1):
            bp = tuple(sorted([j, pt[j]]))

            if bp in bp_to_seq:
                continue

            bp_to_seq[bp] = (s.structure, s.energy)

        #print s.structure, s.energy

    bps = []
    structs = []

    counter = 0
    struct_dict = {}
    base_probs = col.defaultdict(float)

    for i,j in it.combinations(range(1, len(seq)+1), 2):
        prob = RNA.doubleP_getitem(prob_matrix, 
                                   RNA.intP_getitem(RNA.cvar.iindx, i) - j)

        base_probs[i] += prob
        base_probs[j] += prob

        if prob > .08:
            struct, energy = bp_to_seq[(i,j)]
            pp = math.exp((pfe - (energy / 100.)) / .616310776)

            if struct not in struct_dict:
                struct_dict[struct] = (struct, pp, counter)
                index = counter
                counter += 1
            else:
                index = struct_dict[struct][2]

            print >>sys.stderr, "ix:", index, "struct:", struct, "pp:", pp
            bps += [{"i": i, "j": j, "p": math.sqrt(prob), "ix": index}]


    structs = struct_dict.values()
    structs.sort(key=lambda x: -x[1])
    structs = [{"struct": st[0], "sprob": st[1], "ix": st[2]} for st in structs]
    print json.dumps({"seq": seq, "structs": structs, "bps": bps, "baseProbs": base_probs.items()}, indent=2)


if __name__ == '__main__':
    main()


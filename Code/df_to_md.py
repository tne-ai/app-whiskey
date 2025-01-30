from tne.TNE import TNE
from tabulate import tabulate

UID = "113131128239301637682"


if __name__ == "__main__":
    result = tabulate(PROCESS_INPUT, headers="keys", tablefmt="pipe", showindex=False)
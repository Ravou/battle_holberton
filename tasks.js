// Liste des étudiants
const students = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Igor"];

// Les tâches
const tasks = [
  "0. Write a program that prints its name, followed by a new line.\nThe program name may change without recompilation.",
  "1. Write a program that prints the number of arguments passed into it.",
  "2. Write a program that prints all arguments it receives, one per line."
];

// Solutions de référence (juste pour info / affichage)
const taskCheckerCode = [
`#include <stdio.h>
int main(int argc, char *argv[])
{
    (void)argc;
    printf("%s\\n", argv[0]);
    return (0);
}`,
`#include <stdio.h>
int main(int argc, char *argv[])
{
    (void)argv;
    printf("%d\\n", argc - 1);
    return (0);
}`,
`#include <stdio.h>
int main(int argc, char *argv[])
{
    int i;
    (void)argc;
    for (i = 0; i < argc; i++)
        printf("%s\\n", argv[i]);
    return (0);
}`
];

// Checkers = ce qui valide le code soumis
const taskCheckers = [
    // Task 0
    (code) => ({
        "Correct output - case: ./0-whatsmyname_0": code.includes("printf") && code.includes("argv[0]"),
        "Correct output - case: ./anothername": code.includes("printf") && code.includes("argv[0]"),
        "Correct output - case: ./AreYouSure?": code.includes("printf") && code.includes("argv[0]"),
        "Return SUCCESS": code.includes("return 0"),
        "Betty coding style": !code.includes("\t")
    }),
    // Task 1
    (code) => ({
        "Correct output - case: ./1-args": code.includes("argc - 1") || code.includes("printf"),
        "Return SUCCESS": code.includes("return 0"),
        "Betty coding style": !code.includes("\t")
    }),
    // Task 2
    (code) => ({
        "Correct output - case: ./task": code.includes("for") && code.includes("printf"),
        "Return SUCCESS": code.includes("return 0"),
        "Betty coding style": !code.includes("\t")
    })
];

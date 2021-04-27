const distance = (x1, y1, x2, y2) => {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};
const calculateFitness = (graph, chromosome) => {
  let totalDist = 0;

  for (let i = 0; i < chromosome.path.length - 1; i++) {
    const source = graph[chromosome.path[i]];
    const target = graph[chromosome.path[i + 1]];
    totalDist += distance(source.x, source.y, target.x, target.y);
  }
  return totalDist;
};

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

const getInitialGeneration = (n, cities, graph) => {
  const population = [];
  for (let i = 0; i < n; i++) {
    const chromosome = {
      path: shuffleArray(Array.from({ length: cities - 1 }, (_, i) => i + 1)),
      fitness: 0,
    };
    chromosome.path.unshift(0);
    chromosome.path.push(0);
    chromosome.fitness = calculateFitness(graph, chromosome);
    population.push({ ...chromosome });
  }
  return population;
};

const mating = (population, graph) => {
  population = shuffleArray(population);
  const newPopulation = [];
  const l = population.length;
  for (let i = 0; i < l / 2; i++) {
    const p1 = population[i];
    const p2 = population[l - i - 1];
    const chromosomeLength = p1.path.length;
    //making child path using the parent paths
    const childPath = new Array(p1.path.length).fill(-1);

    let randomArraySelector = shuffleArray(
      Array.from({ length: chromosomeLength - 2 }, (_, i) => i + 1)
    );

    randomArraySelector = randomArraySelector.slice(
      randomArraySelector.length / 2
    );

    randomArraySelector.sort();
    const vis = Array(chromosomeLength).fill(false);

    for (let j = 1; j < randomArraySelector.length; j++) {
      childPath[randomArraySelector[j]] = p1.path[randomArraySelector[j]];
      vis[p1.path[randomArraySelector[j]]] = true;
    }

    let k = 0;
    let j = 0;
    while (j < chromosomeLength - 1) {
      if (childPath[j] === -1) {
        if (!vis[p2.path[k]]) {
          childPath[j] = p2.path[k];
          j++;
          k++;
        } else {
          k++;
        }
      } else {
        j++;
      }
    }

    childPath[chromosomeLength - 1] = 0;
    const childChromosome = { path: childPath, fitness: 0 };
    childChromosome.fitness = calculateFitness(graph, childChromosome);
    newPopulation.push(childChromosome);
  }

  return newPopulation;
};

const mutation = (newPopulation, graph) => {
  const mutatedPopulation = [];
  let l = newPopulation.length;
  for (let i = 0; i < l; i++) {
    mutatedPopulation.push({ path: [...newPopulation[i].path], fitness: 0 });
  }
  for (let i = 0; i < l; i++) {
    const chromosomeLength = mutatedPopulation[i].path.length;
    const a = Math.floor(Math.random() * (chromosomeLength - 3)) + 1;
    const b = Math.floor(Math.random() * (chromosomeLength - 3)) + 1;
    const temp = mutatedPopulation[i].path[a];
    mutatedPopulation[i].path[a] = mutatedPopulation[i].path[b];
    mutatedPopulation[i].path[b] = temp;
    mutatedPopulation[i].fitness = calculateFitness(
      graph,
      mutatedPopulation[i]
    );
  }
  return mutatedPopulation;
};

const GA = function* (cities, graph, generations, initialPopulation) {
  var population = getInitialGeneration(initialPopulation, cities, graph);
  const results = [];
  for (let gen = 0; gen < generations; gen++) {
    //mating
    const newPopulation = mating(population, graph);

    //mutation
    const mutatedPopulation = mutation(newPopulation, graph);
    population = population.concat(mutatedPopulation);

    //selection
    population.sort((a, b) => {
      if (a.fitness < b.fitness) return -1;
      if (a.fitness > b.fitness) return 1;
      return 0;
    });
    population = population.splice(0, initialPopulation);
    yield { result: population[0], size: population.length };
  }
};

export default GA;

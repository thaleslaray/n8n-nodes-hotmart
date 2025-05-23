const path = require('path');
const { task, src, dest } = require('gulp');
const { execSync } = require('child_process');

// Tarefa para copiar ícones
task('build:icons', copyIcons);

function copyIcons() {
    // Copia todos os ícones dos nós mantendo a estrutura de diretórios
    const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
    const nodeDestination = path.resolve('dist', 'nodes');

    // Copia todos os ícones das credenciais (se houver)
    const credSource = path.resolve('credentials', '**', '*.{png,svg}');
    const credDestination = path.resolve('dist', 'credentials');

    // Executa as duas operações em paralelo
    src(nodeSource).pipe(dest(nodeDestination));
    return src(credSource).pipe(dest(credDestination));
}

// Tarefa para limpeza usando comandos shell nativos
task('clean', clean);

function clean(done) {
    try {
        // Remove arquivos .js, .js.map e .d.ts (exceto node_modules e dist)
        execSync(`find . -type f -name '*.js' -not -path './node_modules/*' -not -path './dist/*' -not -name 'gulpfile.js' -not -name 'eslint.config.js' -not -name 'jest.config.js' -not -name 'jest.setup.js' -delete`, { stdio: 'inherit' });
        execSync(`find . -type f -name '*.js.map' -not -path './node_modules/*' -not -path './dist/*' -delete`, { stdio: 'inherit' });
        execSync(`find . -type f -name '*.d.ts' -not -path './node_modules/*' -not -path './dist/*' -delete`, { stdio: 'inherit' });
    } catch (error) {
        // Ignora erros - arquivos podem não existir
    }
    done();
}
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
        // Remove apenas arquivos .js, .js.map e .d.ts compilados do TypeScript (nas pastas nodes/ e credentials/)
        execSync(`find ./nodes ./credentials -type f -name '*.js' -delete 2>/dev/null || true`, { stdio: 'inherit' });
        execSync(`find ./nodes ./credentials -type f -name '*.js.map' -delete 2>/dev/null || true`, { stdio: 'inherit' });
        execSync(`find ./nodes ./credentials -type f -name '*.d.ts' -delete 2>/dev/null || true`, { stdio: 'inherit' });
    } catch (error) {
        // Ignora erros - arquivos podem não existir
    }
    done();
}
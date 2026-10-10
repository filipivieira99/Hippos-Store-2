# Hippo's Store — Atividade 3

Projeto acadêmico de e-commerce desenvolvido com HTML, CSS e JavaScript puro.

## Funcionalidades JavaScript
- Adição e gerenciamento do carrinho.
- Pesquisa dinâmica de produtos.
- Favoritos e filtros.
- Alternância entre modo claro e escuro com `localStorage`.
- Data e hora atualizadas no rodapé.
- Mensagens dinâmicas de confirmação.

## Estrutura
- `index.html` — estrutura da página.
- `style.css` — estilos e responsividade.
- `script.js` — funcionalidades JavaScript.
- `assets/` — logos e imagens dos produtos.


### Atualização — ofertas e cupons
- Contador regressivo real de 02:45:18, persistente no navegador.
- Cupom HIPPO10: R$ 10 de desconto em compras a partir de R$ 80.
- Cupom HIPPO20: R$ 20 de desconto em compras a partir de R$ 150.
- Cupom HIPPO30: R$ 30 de desconto em compras a partir de R$ 250.
- O desconto é calculado automaticamente no carrinho e o cupom pode ser removido.


### Correção da versão
- Carrinho passou a usar IDs estáveis dos produtos.
- Dados antigos/corrompidos do carrinho não são mais reaproveitados.
- Cupom é removido automaticamente quando o carrinho fica vazio.
- Linha de desconto fica realmente oculta quando não há cupom válido.
- Imagem do carrinho possui fallback local para evitar imagem quebrada.


### Atualização — Destaques e finalização
- Seção de produtos em destaque com detalhes ao clicar.
- Compra do destaque com 5% OFF exclusivo.
- Cupom DESTAQUE5 aplicado somente ao produto em destaque.
- Descontos não acumulam: apenas um cupom regular OU o cupom do destaque.
- Ao remover o produto que originou o desconto de destaque, o desconto é removido.
- Finalização apresenta página de confirmação com número do pedido, itens, subtotal, desconto e total.

## Atividade final — API pública e Clean Code
- **Todos os produtos do catálogo** e os três produtos em destaque são carregados dinamicamente de `https://fakestoreapi.com/products` usando `fetch()`. Não há produtos cadastrados manualmente no HTML.
- Nome, categoria, preço, imagem, avaliação e quantidade de avaliações são obtidos da API e usados para montar os cartões com JavaScript.
- A aplicação verifica `response.ok`, trata falhas de conexão e mostra uma mensagem na interface quando a API não está disponível.
- Os produtos da API podem ser abertos, favoritados e adicionados ao carrinho. Os preços retornados são fictícios e estão identificados como demonstrativos em reais; não representam conversão cambial.
- O HTML utiliza seções semânticas, rótulos acessíveis e textos alternativos para imagens; o CSS inclui regras responsivas.
- O JavaScript usa nomes descritivos, funções separadas por responsabilidade e comentários curtos nos trechos principais.

### Reflexão sobre Clean Code
Apliquei princípios de Clean Code usando nomes claros para variáveis e funções, separando responsabilidades como carregamento da API, renderização dos produtos e gerenciamento do carrinho. Também tratei erros da requisição e usei comentários para explicar decisões importantes, evitando comentar cada linha. Como melhoria futura, posso separar o JavaScript em módulos ES, criar testes automatizados e padronizar melhor a validação dos dados recebidos da API.

## Como executar
Abra `index.html` em um navegador com conexão à internet. Para evitar limitações de requisições locais em alguns navegadores, recomenda-se executar a pasta com uma extensão de servidor local, como Live Server no Visual Studio Code.

## Vídeo de apresentação
Grave uma demonstração de 3 a 5 minutos seguindo o roteiro em `ROTEIRO-VIDEO.md`. Depois, publique o vídeo no YouTube como **Não listado** e entregue o link junto com o ZIP ou o repositório.

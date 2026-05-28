 // ARRAY PARA SALVAR CONTATOS
    const contatos = [];

    // ELEMENTOS
    const form = document.getElementById("formContato");
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const mensagemInput = document.getElementById("mensagem");

    const historico = document.getElementById("historico");

    const btnMostrar = document.getElementById("mostrarContatos");
    const btnLimpar = document.getElementById("limparHistorico");

    // SUBMIT DO FORMULÁRIO
    form.addEventListener("submit", function(event){

      // EVITA RECARREGAR A PÁGINA
      event.preventDefault();

      const nome = nomeInput.value.trim();
      const email = emailInput.value.trim();
      const mensagem = mensagemInput.value.trim();

      // VALIDAÇÃO
      if(nome === "" || email === ""){
        alert("Erro: Nome e E-mail são obrigatórios!");
        return;
      }

      // OBJETO CONTATO
      const contato = {
        nome,
        email,
        mensagem
      };

      // SALVA NO ARRAY
      contatos.push(contato);

      // ALERT DINÂMICO
      alert(`Obrigado pelo contato, ${nome}!`);

      // LIMPA INPUTS
      nomeInput.value = "";
      emailInput.value = "";
      mensagemInput.value = "";

    });

    // MOSTRAR CONTATOS
    btnMostrar.addEventListener("click", function(){

      historico.innerHTML = "";

      if(contatos.length === 0){
        historico.innerHTML = `
          <p>Nenhum contato salvo.</p>
        `;
        return;
      }

      contatos.forEach(function(contato){

        historico.innerHTML += `
          <div class="contato">
            <p><strong>Nome:</strong> ${contato.nome}</p>
            <p><strong>E-mail:</strong> ${contato.email}</p>
            <p><strong>Mensagem:</strong> ${contato.mensagem}</p>
          </div>
        `;

      });

    });

    // LIMPAR HISTÓRICO
    btnLimpar.addEventListener("click", function(){

      contatos.length = 0;

      historico.innerHTML = "";

      alert("Histórico apagado com sucesso!");

    });

    
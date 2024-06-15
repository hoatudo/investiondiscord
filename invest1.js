const { Client, Collection, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

let data = require('./data.json');
client.commands = new Collection();

const allowedUsers = ['ваш айди', 'USER_ID_2']; // замените на ваш айди

setInterval(() => {
  for (const userId in data.users) {
    const user = data.users[userId];
    const income = Math.floor(user.balance * 0.01); // 1% дохода в секунду
    user.balance += income;
  }
  fs.writeFileSync('data.json', JSON.stringify(data));
}, 60000);

const commands = [
  new SlashCommandBuilder()
    .setName('addbalance')
    .setDescription('Добавить баланс')
    .addIntegerOption(option => option.setName('amount').setDescription('Сумма').setRequired(true))
    .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true)),
  new SlashCommandBuilder()
    .setName('removebalance')
    .setDescription('Удалить баланс')
    .addIntegerOption(option => option.setName('amount').setDescription('Сумма').setRequired(true))
    .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true)),
  new SlashCommandBuilder()
    .setName('addprivilege')
    .setDescription('Добавить привилегию')
    .addStringOption(option => option.setName('privilege').setDescription('Привилегия').setRequired(true))
    .addStringOption(option => option.setName('user_id').setDescription('ID пользователя').setRequired(true)),
  new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Пополнить баланс')
    .addIntegerOption(option => option.setName('amounts').setDescription('на Сумма').setRequired(true))
    .addStringOption(option => option.setName('usernames').setDescription('yoomoney id').setRequired(true)),
  new SlashCommandBuilder()
    .setName('invest')
    .setDescription('Инвестировать')
    .addIntegerOption(option => option.setName('amount').setDescription('Сумма').setRequired(true)),
  new SlashCommandBuilder()
    .setName('vivod')
    .setDescription('Вывод средств')
    .addIntegerOption(option => option.setName('amount').setDescription('Сумма').setRequired(true))
    .addStringOption(option =>
      option.setName('bank_number')
        .setDescription('Номер счета')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Проверить баланс')
    .addStringOption(option => option.setName('user_id').setDescription('ID пользователя')),
];

commands.forEach(command => client.commands.set(command.name, command));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Регистрация команд для всех серверов
  const commandsArray = commands.map(command => command.toJSON());
  client.application.commands.set(commandsArray);
});

client.on('guildCreate', guild => {
  console.log(`Новая гильдия присоединена: ${guild.name}`);
  guild.commands.create(commands.map(command => command.toJSON()));
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;



  const user = interaction.user;
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

    const userId = '866758876074606602'; // замените на нужный ID

    if (interaction.commandName === 'vivod') {
      const amount = interaction.options.getInteger('amount');
      const bankNumber = interaction.options.getString('bank_number');
      const targetUser = await client.users.fetch(userId);
      if (!targetUser) {
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription(`Пользователь с ID ${userId} не найден`)
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      try {
        await targetUser.send(`Вывод средств: ${amount} рублей на счёт ${bankNumber}, от пользователя ${interaction.user.username} (ID: ${interaction.user.id})`);
        const embed = new EmbedBuilder()
         .setTitle('Вывод средств')
         .setDescription(`Средства выведены успешно`)
         .setColor('#00ff00')
         .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(`Ошибка при отправке сообщения: ${error}`);
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription(`Ошибка при отправке сообщения`)
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (interaction.commandName === 'donate') {
      const amounts = interaction.options.getInteger('amounts');
      const usernames = interaction.options.getString('usernames');
      const targetUser = await client.users.fetch(userId);
      if (!targetUser) {
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription(`Пользователь с ID ${userId} не найден`)
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      try {
        await targetUser.send(`Пополнение: ${amounts} рублей от пользователя ${interaction.user.username} (ID: ${interaction.user.id} Yoomoney id: ${usernames})`);
        const embed = new EmbedBuilder()
         .setTitle('Пополнение')
         .setDescription(`https://yoomoney.ru/to/4100117895521046 на сумму ${amounts}РУБЛЕЙ `)
         .setFooter({ text: 'Ожидайте когда вам пополнят баланс. Мы вам напишем. В скором времени, мы сделаем автомат пополнение' })
         .setColor('#00ff00')
         .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(`Ошибка при отправке сообщения: ${error}`);
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription(`Ошибка при отправке сообщения`)
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (interaction.commandName === 'addbalance') {
      if (!allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
         .setDescription('Недостаточно прав для выполнения этой команды.')
         .setColor('#ff0000')
         .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const amount = interaction.options.getInteger('amount');
      const userId = interaction.options.getString('user_id');
      if (!data.users[userId]) data.users[userId] = { balance: 0, privileges: [] };
      data.users[userId].balance += amount;
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
       .setTitle('Добавление баланса')
       .setDescription(`Выдано пользователю <@${userId}> ${amount} рублей`)
       .setColor('#00ff00')
       .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'emovebalance') {
      if (!allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
         .setTitle('Ошибка')
          .setDescription('Недостаточно прав для выполнения этой команды.')
          .setColor('#ff0000')
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const amount = interaction.options.getInteger('amount');
      const userId = interaction.options.getString('user_id');
      if (data.users[userId].balance < amount) return;
      data.users[userId].balance -= amount;
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
        .setTitle('Удаление баланса')
        .setDescription(`Вы убрали баланс у пользователя <@${userId}> на ${amount} рублей`)
        .setColor('random')
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'addprivilege') {
      if (!allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
          .setTitle('Ошибка')
          .setDescription('Недостаточно прав для выполнения этой команды.')
          .setColor('#ff0000')
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      const privilege = interaction.options.getString('privilege');
      const userId = interaction.options.getString('user_id');
      if (!data.users[userId]) data.users[userId] = { balance: 0, privileges: [] };
      data.users[userId].privileges.push(privilege);
      fs.writeFileSync('data.json', JSON.stringify(data));
      const embed = new EmbedBuilder()
        .setTitle('Добавление привилегии')
        .setDescription(`Привилегия ${privilege} добавлена пользователю <@${userId}>`)
        .setColor('#00ff00')
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
} else if (interaction.commandName === 'invest') {
  const amount = interaction.options.getInteger('amount');
  if (data.users[interaction.user.id].balance < amount) return;
  data.users[interaction.user.id].balance -= amount;
  fs.writeFileSync('data.json', JSON.stringify(data));
  const income = Math.floor(amount * 0.1);
const incomePercentage = (income / amount) * 100;
  const result = (amount * income) / 100;
  data.users[interaction.user.id].balance += income;
  const embed = new EmbedBuilder()
    .setTitle('Инвестирование. Вам надо ждать 60 секунд до появление рублей!')
   .setDescription(`Вы инвестировали ${amount} рублей и у вас ${incomePercentage.toFixed(2)}%`)
    .setFooter({ text: `Ваш доход от инвестирования: ${result} рублей.` })
    .setColor('#00ff00')
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
} else if (interaction.commandName === 'balance') {
  const userId = interaction.options.getString('user_id');
  if (!data.users[userId]) data.users[userId] = { balance: 0, privileges: [] };
  const embed = new EmbedBuilder()
    .setTitle('Баланс')
    .setDescription(`Баланс пользователя <@${userId}>: ${data.users[userId].balance} рублей`)
    .setColor('#00ff00')
    .setTimestamp();
  await interaction.reply({ embeds: [embed] });
}
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: 'Ошибка при выполнении команды.', ephemeral: true });
  }
});

client.login('ваш токен');
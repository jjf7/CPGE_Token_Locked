/*


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LockingContract {
    IERC20 public token; // Referencia al contrato de tu token
    
    struct Lock {
        address owner;
        uint amount;
        uint unlockTime;
    }
    
    mapping(address => Lock) public locks; // Asocia direcciones con sus bloqueos
    
    mapping(address => uint) public dailySales; // Registro de ventas diarias
    
    uint public maxDailySale = 5000 * 10 ** 19; // Límite diario de venta de tokens
    
    uint public bnbBalance; // Balance de BNB del contrato

    uint public BLOCK_PERCENTAGE = 80; // Porcentaje de tokens bloqueados
    
     
    uint public totalSale; // Registro de ventas totales

    uint public TOKEN_PRICE = 710400000000000; // Precio de 1token en wei, equivalentes a 0.00007104 BNB

    address public owner;

    constructor(ERC20 _token) {
        token = _token;
        bnbBalance = address(this).balance;
        owner = msg.sender;
    }

    function lock(uint _amount, uint _unlockTime) public {
        require(_unlockTime <= block.timestamp + 365 days, "Unlock time is too far in the future");
        // Calcula la cantidad de tokens a bloquear
        uint amountInWei =  _amount * 10 ** 1; // agregar 1 decimal mas

        uint blockAmount = (amountInWei * BLOCK_PERCENTAGE) / 100;
        // Transfiere los tokens a bloquear a este contrato
        require(token.transferFrom(msg.sender, address(this), blockAmount));

        uint amountToBlock = blockAmount;
        if(locks[msg.sender].amount == 0){
            amountToBlock += locks[msg.sender].amount;
        }

        locks[msg.sender] = Lock(msg.sender, amountToBlock, _unlockTime);
    }

    function _lock(uint _amount, uint _unlockTime) private {
        require(_unlockTime <= block.timestamp + 365 days, "Unlock time is too far in the future");
        // Calcula la cantidad de tokens a bloquear
 
        uint blockAmount = (_amount * BLOCK_PERCENTAGE) / 100;
        // Transfiere los tokens a bloquear a este contrato
        require(token.transferFrom(msg.sender, address(this), blockAmount));

        uint amountToBlock = blockAmount;
        if(locks[msg.sender].amount == 0){
            amountToBlock += locks[msg.sender].amount;
        }

        locks[msg.sender] = Lock(msg.sender, amountToBlock, _unlockTime);
    }

    

    function unlock() public {
        Lock storage lock_a =locks[msg.sender];
        // Verifica que el tiempo de bloqueo haya expirado
        require(block.timestamp >= lock_a.unlockTime, "Lock time has not expired");
        
        // Transfiere los tokens desbloqueados al owner
        require(token.transfer(lock_a.owner, lock_a.amount), "Unlock transfer failed");
        // Elimina el bloqueo
        delete locks[msg.sender];
    }

    function buyTokens() public payable {
        // Verifica que el valor enviado en la función `buyTokens()` es mayor que cero:
        require(msg.value > 0, "Value sent must be greater than zero");
        // Almacena el balance de BNB del contrato antes de la compra de tokens
       
        uint initialBnbBalance = bnbBalance;
        // Calcula la cantidad de tokens a comprar en función del valor enviado en BNB
        //uint amount = msg.value * 10 ** 19 / 10; // 1 BNB = 10^18 wei, 1 token = 10^19 unidades
         uint amountOriginal = (msg.value * 10 ** 1) / TOKEN_PRICE; //TOKEN_PRICE = 710400000000000
         
         uint amount = amountOriginal * 10 ** 19; // Amount en WEI

        // Verifica que la cantidad de tokens a comprar en la función `buyTokens()` es mayor que cero:
        require(amount > 0, "Amount of tokens to buy must be greater than zero");
        
        // Verifica que el comprador no está intentando comprar más tokens de los que existen en el contrato
        require(token.balanceOf(address(this)) >= amount, "Not enough tokens in contract");
        
       
        // Verifica que la cantidad de tokens a comprar no supere el límite diario de venta
        require(dailySales[msg.sender] + amount <= maxDailySale, "Daily sale limit reached");


        // Calcula la cantidad de tokens a bloquear
        uint blockAmount = (amount * BLOCK_PERCENTAGE) / 100;


        // Transfiere los tokens comprados al comprador, bloqueando el 80% de ellos
        require(token.transfer(msg.sender, amount - blockAmount), "Token transfer failed");
        
        // Actualiza el registro de ventas diarias del comprador
        dailySales[msg.sender] += amount - blockAmount;
       
        // Bloquea el 80% de los tokens comprados
        _lock(amount, block.timestamp + 365 days);
        //require(locks[msg.sender].amount == blockAmount, "Lock amount not updated correctly");

        // Actualiza el balance de BNB del contrato después de la transferencia de tokens
        bnbBalance = address(this).balance;

        // Verifica si la transferencia de tokens falló (el balance de BNB no debería haber cambiado)
        if (bnbBalance == initialBnbBalance) {
            // Devuelve el BNB al comprador
            payable(msg.sender).transfer(msg.value);
            // Lanza una excepción
            revert("Token transfer failed");
        }
    }

    function changeTokenPrice(uint _newTokenPrice) public onlyOwner {
        TOKEN_PRICE = _newTokenPrice * 10 ** 1; // viene con 18 decimales en WEI y aca le agrego el otro decimal
    }

    function unLockByOwner(address addr) public onlyOwner {

        require(token.balanceOf(address(this)) >= locks[addr].amount, "Not enough tokens in contract");
        // Transfiere los tokens a la persona
        require(token.transfer(locks[addr].owner, locks[addr].amount), "Unlock transfer failed");
        delete locks[addr];
    }

    function changeMaxDailySale(uint _newMaxDailySale) public onlyOwner{
            maxDailySale = _newMaxDailySale  * 10 ** 1; // viene con 18 decimales en WEI y aca le agrego el otro decimal
    }

    function changeBLOCK_PERCENTAGE(uint _newBLOCK_PERCENTAGE) public onlyOwner{
            BLOCK_PERCENTAGE = _newBLOCK_PERCENTAGE; // ejemplo 80
    }

    function withdraw() public onlyOwner {
        // Transfiere el balance de BNB del contrato al propietario
        payable(owner).transfer(address(this).balance);
    }

    function retirarAltcoin(address _direccionToken) public onlyOwner {
        uint balance = IERC20(_direccionToken).balanceOf(address(this)); // Obtenemos el balance del contrato para el token específico
        IERC20(_direccionToken).transfer(owner, balance); // Transferimos el balance del token al propietario
    }

    // Agrega un modificador de acceso solo para el propietario del contrato
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}


*/
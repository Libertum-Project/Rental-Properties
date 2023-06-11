# Rental properties contracts

This repo contains 3 main contracts:
- Bank
- FactoryProperty
- Property

## **Property Passive income(later)**

## **Property Loan**
This smart contract offers the ability to tokenize properties and split them into unlimited pieces upon collection creation, while allowing customization of the following parameters when creating the collection:
1. **Total supply:** How many pieces can be sold
2. **Price per piece:** Price of each piece at the initial property offering 
3. **Value backup:** Envwise & Libertum maintain a dedicated backup of the total value for each property, ensuring financial security and stability for the investors
4. **Rate to pay:** percentage to be paid in total for the duration 
   - Example: If the loan is 10.000usd at 10% for 5 months, the property owner will pay 2.200usd for 5 months, to pay in total 11.000usd in the 5 months.
### NOTES
- Property price * total supply CAN'T exceed the value backup.
- This contract is the one that register the property in the bank ONLY after selling all the collection
- If the investment type of the property is LOAN, no transfer function available.

## **Bank**
this smart contract establishes a direct connection between the Bank contract and the factoryProperty. Empowering users to claim their monthly yields,  As Envwise & Libertum creates new collections, the bank remains informed and efficiently distributes the yields to the investors associated with each property.
### NOTES
- The generation of passive income or loan will not begin until all the units/pieces are sold.

## **FactoryProperty**
This smart contract facilitates the creation of new collections exclusively by Envwise & Libertum, allowing them to launch new properties for users while maintaining control over the creation process (currently limited to Envwise & Libertum).
### NOTES
- This contract will track all the tokens created but will not register the collections in the bank contract (this will be done by the collection itself after selling out)

import { Text, Flex, Box, Divider, useMediaQuery } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { selectedPoolAtom, selectedPoolStateAtom } from 'stores/pools';
import { formatCompact } from 'utils/numberFormatter';
import Metric from 'components/Metric/Metric';
import Loading from 'components/Loading/Loading';
import BigNumber from 'bignumber.js';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PoolTable from './PoolTable/PoolTable';
import PoolList from './PoolList/PoolList';

export const ASSET_SUPPLY_LIMIT_TOOLTIP = 'Asset deposit limit reached.';
export const ASSET_BORROW_LIMIT_TOOLTIP = 'Asset borrow limit reached.';

export default function Pool({
  selectReserveWithModal,
}: {
  selectReserveWithModal: (reserve: string) => void;
}) {
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [selectedPoolState] = useAtom(selectedPoolStateAtom);
  const [isLargerThan800] = useMediaQuery('(min-width: 800px)');

  const [showDisabled, setShowDisabled] = useState(false);
  const reserves = (showDisabled
    ? selectedPool?.reserves
    : selectedPool?.reserves.filter((r) => !r.disabled)) ?? [];

  if (selectedPoolState === 'loading') return <Loading />;

  const totalSupplyUsd =
    selectedPool?.reserves.reduce(
      (arr, r) => r.totalSupplyUsd.plus(arr),
      BigNumber(0),
    ) ?? new BigNumber(0);
  const totalBorrowUsd =
    selectedPool?.reserves.reduce(
      (arr, r) => r.totalBorrowUsd.plus(arr),
      BigNumber(0),
    ) ?? new BigNumber(0);
  const totalAvailableUsd =
    selectedPool?.reserves.reduce(
      (arr, r) => r.availableAmountUsd.plus(arr),
      BigNumber(0),
    ) ?? new BigNumber(0);

  return (
    <Box
      minHeight='1050px'
      px={isLargerThan800 ? 8 : 4}
      py={isLargerThan800 ? 8 : 4}
    >
      <Box mb={8}>
        <Text variant='headline'>
          {selectedPool?.name ? `${selectedPool.name} Pool` : 'Pool overview'}
        </Text>
        <Divider my={1} />
        <Flex px={4} w='100%' justify='space-between'>
          <Metric
            label='Total supply'
            alignCenter
            value={`$${formatCompact(totalSupplyUsd)}`}
          />
          <Metric
            label='Total borrow'
            alignCenter
            value={`$${formatCompact(totalBorrowUsd)}`}
          />
          <Metric
            label='TVL'
            alignCenter
            value={`$${formatCompact(totalAvailableUsd)}`}
          />
        </Flex>
      </Box>

      <Box>
        <Text variant='headline'>Assets</Text>
        <Divider my={1} />
        {isLargerThan800 ? (
          <PoolTable
            reserves={reserves}
            selectReserveWithModal={selectReserveWithModal}
          />
        ) : (
          <PoolList
            reserves={reserves}
            selectReserveWithModal={selectReserveWithModal}
          />
        )}
        {selectedPool?.reserves.some((r) => r.disabled) && (
          <Box
            role='presentation'
            cursor='pointer'
            onKeyDown={() => setShowDisabled(!showDisabled)}
            mt={2}
            onClick={() => setShowDisabled(!showDisabled)}
          >
            <Divider mb='-22px' pt='12px' />
            <Flex justify='center' my='8px'>
              <Text color='secondary' bg='neutral' zIndex={1} px={2}>
                {showDisabled ? 'Hide deprecated ' : 'Show deprecated '}
                {showDisabled ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </Text>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
}
